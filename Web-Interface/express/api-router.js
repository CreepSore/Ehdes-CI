"use strict";
const fetch = require("node-fetch").default;
const guuid = require("uuid");

const log = function(msg, context) {
    console.log(`[${new Date().toISOString()}][Express]${context ? `[${context}]` : ""} ${msg}`);
};

const register = function(storage, app) {
    app.post("/api/register", (req, res) => {
        let agents = storage.get("EXPRESS.AGENTS", []);
        let agentData = req.body.agent;
        let agent = agents.filter(a => a.uuid === agentData.uuid);

        if (agent.length === 0) { // if agent doesn't already exist
            agentData.lastKeepalive = Number(new Date());
            agents.push(agentData);
            log(`Adding Agent[${agentData.uuid}].`, "API/Register");
        }
        else {
            agent[0].lastKeepalive = Number(new Date());
            agent[0].workspaces = agentData.workspaces;
        }
        res.end(JSON.stringify({ success: true }));
    });
};

const jobs = function(storage, app) {
    app.get("/api/jobs", (req, res) => {
        let uuid = req.query.uuid;
        res.end(JSON.stringify(storage.get("EXPRESS.JOBS").filter(j => j.agentid === uuid || uuid === "*")));
    });

    app.post("/api/jobs/unquery", (req, res) => {
        if (!req.body.job) {
            res.end(JSON.stringify({ success: false, error: 100 }));
            return;
        }
        let job = req.body.job;

        if (!job.jobid) {
            res.end(JSON.stringify({ success: false, error: 10001 }));
        }

        let sJobs = storage.get("EXPRESS.JOBS");
        sJobs.splice(sJobs.indexOf(job), 1);
        res.end(JSON.stringify({ success: true, error: 0, jobid: job.jobid }));
        log(`Removing Job[${job.jobid}].`, "API/jobs/unquery");
    });

    app.post("/api/jobs", (req, res) => {
        if (!req.body.job) {
            res.end(JSON.stringify({ success: false, error: 100 }));
            return;
        }
        let job = req.body.job;
        if (!job.agentid) {
            res.end(JSON.stringify({ success: false, error: 10000 }));
            return;
        }

        if (!job.jobid) {
            job.jobid = guuid.v1().toString();
        }

        let sJobs = storage.get("EXPRESS.JOBS");
        if (job.workspace) {
            sJobs.push(job);
            res.end(JSON.stringify({ success: true, error: 0, jobid: job.jobid }));
            log(`Adding Job[${job.jobid}].`, "API/jobs");
        }
        else {
            res.end(JSON.stringify({ success: false, error: 10002 }));
        }
    });
};

const agents = function(storage, app) {
    app.get("/api/agents", (req, res) => {
        res.end(JSON.stringify(storage.get("EXPRESS.AGENTS")));
    });
};

const buildresults = function(storage, app) {
    app.get("/api/buildresults", (req, res) => {
        res.end(JSON.stringify(storage.get("EXPRESS.BUILDS", [])));
    });

    app.get("/api/buildresults/:jobid", (req, res) => {
        res.end(JSON.stringify(storage.get("EXPRESS.BUILDS", []).filter(b => b.job.jobid === req.params.jobid)));
    });

    app.get("/api/buildresults/workspace/:workspace", (req, res) => {
        res.end(JSON.stringify(storage.get("EXPRESS.BUILDS", []).filter(b => b.job.workspace === req.params.workspace)));
    });

    app.get("/api/buildresults/workspace/latest/:workspace", (req, res) => {
        let builds = storage.get("EXPRESS.BUILDS", []).filter(b => b.job.workspace === req.params.workspace);
        if (builds.length > 0) {
            res.end(JSON.stringify(builds[builds.length - 1]));
        }
        else {
            res.end("{}");
        }
    });

    app.get("/api/buildresults/shield/workspace/latest/:agentname/:workspace", (req, res) => {
        let builds = storage.get("EXPRESS.BUILDS", []).filter(b => b.job.workspace === req.params.workspace && b.job.agent === req.params.agentname);
        let shield = "NO_BUILD";
        if (builds.length > 0) {
            let build = builds[builds.length - 1];
            if (build.summary.success) {
                shield = "SUCCEEDED";
            }
            else {
                shield = "FAILED";
            }
        }

        res.set("Cache-Control", "no-cache");
        res.set("Content-Type", "image/svg+xml;charset=utf-8");
        res.end(storage.get(`DEP.SHIELDS.${shield}`));
    });

    app.post("/api/buildresults", (req, res) => {
        let result = req.body.buildresult;
        storage.get("EXPRESS.BUILDS").push(result);

        let sjobs = storage.get("EXPRESS.JOBS");
        if (sjobs.filter(j => result.job.jobid === j.jobid).length > 0) {
            let job = sjobs[0];
            sjobs.splice(sjobs.indexOf(job), 1);
        }

        res.end(JSON.stringify({ success: true, error: 0 }));
    });
};

const prefetchShields = function(storage) {
    let toFetch = [
        {
            name: "NO_BUILD",
            url: "https://img.shields.io/badge/build-no%20build-lightgray"
        },
        {
            name: "SUCCEEDED",
            url: "https://img.shields.io/badge/build-succeeded-green"
        },
        {
            name: "FAILED",
            url: "https://img.shields.io/badge/build-failed-red"
        }
    ];

    toFetch.forEach((shield, i) => {
        setTimeout(() => {
            fetch(shield.url)
                .then(hres => hres.text())
                .then(body => {
                    log(`Preloaded ${shield.name}`, "ShieldCaching");
                    storage.register(`DEP.SHIELDS.${shield.name}`, body);
                }).catch(() => {
                    log(`Failed to preload ${shield.name}`, "ShieldCaching");
                });
        }, i * 1000);
    });
};

const registerApi = function(storage, app) {
    app.use((req, res, next) => {
        if (req.path.startsWith("/api/")) {
            log(`[${req.connection.remoteAddress}] Accessing [${req.originalUrl}]`);
            if (!storage.get("EXPRESS.API.WHITELIST", []).filter(w => req.path.startsWith(w))) {
                if (!req.query.secret || req.query.secret !== storage.get("EXPRESS.SECRET")) {
                    res.end(JSON.stringify({ success: false, error: -1 }));
                    return;
                }
            }
        }
        next();
    });

    prefetchShields(storage);
    register(storage, app);
    jobs(storage, app);
    agents(storage, app);
    buildresults(storage, app);
};

module.exports = registerApi;
