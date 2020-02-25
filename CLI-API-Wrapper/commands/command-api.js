"use strict";
const url = require("url");
const fetch = require("node-fetch").default;

const CommandHandler = require("./command-handler");

const cmdFetchJobs = function(args) {
    let apiurl = new url.URL(`${args.cfg.baseurl}/api/jobs`);
    apiurl.searchParams.append("secret", args.cfg.secret);
    apiurl.searchParams.append("uuid", "*");

    fetch(apiurl)
        .then(res => res.json())
        .then(jobs => console.log(JSON.stringify(jobs, null, 4)))
        .catch(ex => console.log(JSON.stringify(ex, null, 4)));
};

const enqueueJob = function(args) {
    if(args.length < 2) {
        return;
    }

    let apiurl = new url.URL(`${args.cfg.baseurl}/api/jobs`);
    apiurl.searchParams.append("secret", args.cfg.secret);

    let body = {
        job: {
            agentid: args[0],
            workspace: args[1]
        }
    };

    fetch(apiurl, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
    }).then(res => res.text())
        .then(b => console.log(b))
        .catch(ex => console.log(ex));
};

const resolveEnqueueJob = function(args) {
    if(args.length < 3) {
        return;
    }

    let apiurl = new url.URL(`${args.cfg.baseurl}/api/agents`);
    apiurl.searchParams.append("secret", args.cfg.secret);

    fetch(apiurl)
        .then(res => res.json())
        .then(agents => {
            let agent = agents.filter(a => a.label === args[0]);
            args[0] = agent.uuid;
            enqueueJob(args);
        }).catch(ex => console.log(JSON.stringify(ex, null, 4)));
};

const cmdFetchAgents = function(args) {
    let apiurl = new url.URL(`${args.cfg.baseurl}/api/agents`);
    apiurl.searchParams.append("secret", args.cfg.secret);

    fetch(apiurl)
        .then(res => res.json())
        .then(jobs => console.log(JSON.stringify(jobs, null, 4)))
        .catch(ex => console.log(JSON.stringify(ex, null, 4)));
};

const cmdFetchBuildresults = function(args) {
    let apiurl = new url.URL(`${args.cfg.baseurl}/api/buildresults`);
    apiurl.searchParams.append("secret", args.cfg.secret);

    fetch(apiurl)
        .then(res => res.json())
        .then(jobs => console.log(JSON.stringify(jobs, null, 4)))
        .catch(ex => console.log(JSON.stringify(ex, null, 4)));
};

module.exports = function(args) {
    let cmd = args.splice(0, 1)[0];
    let cmdHandler = new CommandHandler(args.storage, false);
    cmdHandler.registerCommand(["j", "jobs", "fetchJobs", "viewJobs"], cmdFetchJobs);
    cmdHandler.registerCommand(["bs", "buildresult", "buildresults"], cmdFetchBuildresults);
    cmdHandler.registerCommand(["a", "agent", "agents"], cmdFetchAgents);
    cmdHandler.registerCommand(["enqueue"], enqueueJob);
    cmdHandler.registerCommand(["renqueue"], resolveEnqueueJob);

    args.cfg = args.storage.get("CFG");
    args.cmd = cmd;
    cmdHandler.trigger(cmd, args);
};
