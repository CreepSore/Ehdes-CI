"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

// eslint-disable-next-line no-unused-vars
const KeyStorage = require("../handler/key-storage");
const routeApi = require("./api-router");

const log = function(msg, context) {
    console.log(`[${new Date().toISOString()}][Express]${context ? `[${context}]` : ""} ${msg}`);
};

const checkKeepalive = function(agents, storage) {
    let currentDate = Number(new Date());
    agents.forEach((agent, i) => {
        if(!agent.lastKeepalive || currentDate - agent.lastKeepalive > storage.get("EXPRESS.AGENT_TIMEOUT", 10000)) {
            agents.splice(i, 1);
            console.log(`Removed agent with id ${agent.uuid} because of timeout`, "keepalive");
        }
    });
};

const registerViews = function(storage, app) {
    app.get("/jobdetails/:jobid", (req, res) => {
        let buildresult = {};
        let job = storage.get("EXPRESS.JOBS").filter(j => j.jobid === req.params.jobid)[0];
        if(!job) {
            job = storage.get("EXPRESS.BUILDS").filter(b => b.job.jobid === req.params.jobid)[0];
            buildresult = job;
            if(job) {
                job = buildresult.job; // unwrapping job from buildresult
            }
            else {
                res.redirect("/startjob");
                return;
            }
        }

        res.render("job-details", {
            job: job,
            buildresult: buildresult,
            secret: storage.get("EXPRESS.SECRET")
        });
    });

    app.get("/jobdetails/workspace/latest/:workspace", (req, res) => {
        let builds = storage.get("EXPRESS.BUILDS", []).filter(b => b.job.workspace === req.params.workspace);
        if(builds.length > 0) {
            let build = builds[builds.length - 1];
            res.redirect(`/jobdetails/${build.job.jobid}`);
        }
        else {
            res.redirect("/");
        }
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
    app.use(express.static(path.join(__dirname, "static")));
    app.set("view engine", "ejs");
    app.set("views", path.join(__dirname, "views"));

    routeApi(storage, app);
    registerViews(storage, app);
    storage.get("PLUGIN_MANAGER").callPluginFunction("onExpressInit", app, "Wi");

    let host = storage.get("EXPRESS.HOST", "127.0.0.1");
    let port = storage.get("EXPRESS.PORT", 8099);
    app.listen(port, host);
    log(`Listening on "${host}:${port}"`, "init");

    setInterval(checkKeepalive, 1000, storage.get("EXPRESS.AGENTS"), storage);
    log("Starting Keep-Alive interval", "init");
};

module.exports = intialize;
