"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// eslint-disable-next-line no-unused-vars
const KeyStorage = require("../handler/key-storage");

const log = function(msg, context) {
    console.log(`[${new Date().toISOString()}][Express]${context ? `[${context}]` : ""} ${msg}`);
};

const checkKeepalive = function(agents, storage) {
    let currentDate = Number(new Date());
    agents.forEach((agent, i) => {
        if(!agent.lastKeepalive || currentDate - agent.lastKeepalive > storage.get("EXPRESS.AGENT_TIMEOUT", 5000)) {
            agents.splice(i, 1);
            console.log(`Removed agent with id ${agent.uuid} because of timeout`, "keepalive");
        }
    });
};

const registerApi = function(storage, app) {
    app.post("/api/register", (req, res) => {
        let agents = storage.get("EXPRESS.AGENTS", []);
        let agentData = JSON.parse(req.body.agent);
        let agent = agents.filter(a => a.uuid === agentData.uuid);

        if(agent.length === 0) {
            agentData.lastKeepalive = Number(new Date());
            agents.push(agentData);
            log(`Adding Agent[${agentData.uuid}].`, "API/Register");
        }
        else {
            agent[0].lastKeepalive = Number(new Date());
        }
        res.end(JSON.stringify({success: true}));
    });

    app.get("/api/jobs", (req, res) => {
        let uuid = req.query.uuid;
        let jobs = storage.get("EXPRESS.JOBS");
        res.end(JSON.stringify(jobs.filter(j => j.agentid === uuid)));
    });

    app.post("/api/jobs", (req, res) => {
        let job = JSON.parse(req.body.job);
        if(!job.agentid) {
            res.end(JSON.stringify({success: false, error: 10000}));
            return;
        }

        let jobs = storage.get("EXPRESS.JOBS");
        if(job.jobid && job.workspace) {
            jobs.push(job);
            res.end(JSON.stringify({success: true, error: 0}));
        }
        else {
            res.end(JSON.stringify({success: false, error: 10002}));
        }
    });

    app.get("/api/agents", (req, res) => {
        let agents = storage.get("EXPRESS.AGENTS");
        res.end(JSON.stringify(agents));
    });

    app.get("/api/buildresults", (req, res) => {
        res.end(JSON.stringify(storage.get("EXPRESS.BUILDS", [])));
    });

    app.post("/api/buildresults", (req, res) => {
        let result = req.body.buildresult;
        storage.get("EXPRESS.BUILDS").push(result);
        res.end(JSON.stringify({success: true, error: 0}));
    });
};

const registerViews = function(storage, app) {
    app.get("/agents", (req, res) => {
        res.end(JSON.stringify(storage.get("EXPRESS.AGENTS", [])));
    });
};

/**
 * @param {KeyStorage} storage General Storage
 */
const intialize = function(storage) {
    let app = express();
    storage.register("EXPRESS.BASE_PATH", __dirname);
    storage.register("EXPRESS.APP", app);
    storage.register("EXPRESS.AGENTS", []);
    storage.register("EXPRESS.JOBS", []);
    storage.register("EXPRESS.BUILDS", []);

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));
    app.use("/static", express.static(path.join(__dirname, "static")));
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    registerApi(storage, app);
    registerViews(storage, app);

    let host = storage.get("EXPRESS.HOST", "127.0.0.1");
    let port = storage.get("EXPRESS.PORT", 8099);
    app.listen(port, host);
    log(`Listening on "${host}:${port}"`, "init");

    setInterval(checkKeepalive, 1000, storage.get("EXPRESS.AGENTS"), storage);
    log("Starting Keep-Alive interval", "init");
};

module.exports = intialize;
