"use strict";

const log = function(msg, context) {
    console.log(`[${new Date().toISOString()}][Express]${context ? `[${context}]` : ""} ${msg}`);
};

const register = function(storage, app) {
    app.post("/api/register", (req, res) => {
        let agents = storage.get("EXPRESS.AGENTS", []);
        let agentData = req.body.agent;
        let agent = agents.filter(a => a.uuid === agentData.uuid);

        if(agent.length === 0) { // if agent doesn't already exist
            agentData.lastKeepalive = Number(new Date());
            agents.push(agentData);
            log(`Adding Agent[${agentData.uuid}].`, "API/Register");
        }
        else {
            agent[0].lastKeepalive = Number(new Date());
            agent[0].workspaces = agentData.workspaces;
        }
        res.end(JSON.stringify({success: true}));
    });
};

const jobs = function(storage, app) {
    app.get("/api/jobs", (req, res) => {
        let uuid = req.query.uuid;
        res.end(JSON.stringify(storage.get("EXPRESS.JOBS").filter(j => j.agentid === uuid)));
    });

    app.post("/api/jobs", (req, res) => {
        let job = JSON.parse(req.body.job);
        if(!job.agentid) {
            res.end(JSON.stringify({success: false, error: 10000}));
            return;
        }

        let sJobs = storage.get("EXPRESS.JOBS");
        if(job.jobid && job.workspace) {
            sJobs.push(job);
            res.end(JSON.stringify({success: true, error: 0}));
            log(`Adding Job[${job.jobid}].`, "API/jobs");
        }
        else {
            res.end(JSON.stringify({success: false, error: 10002}));
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

    app.post("/api/buildresults", (req, res) => {
        let result = req.body.buildresult;
        storage.get("EXPRESS.BUILDS").push(result);
        res.end(JSON.stringify({success: true, error: 0}));
    });
};

const registerApi = function(storage, app) {
    register(storage, app);
    jobs(storage, app);
    agents(storage, app);
    buildresults(storage, app);
};

module.exports = registerApi;
