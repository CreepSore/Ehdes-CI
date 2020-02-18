"use strict";
const path = require("path");
const fs = require("fs");
const childProcess = require("child_process");

class AgentRunner {
    constructor(storage) {
        this.storage = storage;
        this.agentPath = path.join(this.storage.getObject("BASE_PATH"), this.storage.getObject("CFG").getConfig().agent.path);

        if(!fs.existsSync(this.agentPath)) {
            throw new Error(`Agent does not exist at specified path [${this.agentPath}]`);
        }
    }

    buildWorkspace(workspace) {
        return new Promise(res => {
            let agentproc = childProcess.fork(this.agentPath, ["build", `workspace=${workspace}`], {
                silent: true,
                execArgv: []
            });

            agentproc.stdout.on("data", data => {
                try {
                    let log = JSON.parse(data.toString());
                    if(log.logtype === "summary") {
                        res(log.summary);
                    }
                }
                catch (ex) {
                    process.stdout.write(data);
                }
            });
        });
    }

    getWorkspaces() {
        return new Promise(res => {
            let agentproc = childProcess.fork(this.agentPath, ["ws"], {
                silent: true,
                execArgv: []
            });

            agentproc.stdout.on("data", data => {
                let lines = data.toString().split("\n");

                let workspaces = [];
                lines.forEach(line => {
                    let match = line.match(/(.*) -> (.*)/);
                    if(!match || match.length !== 3) return;

                    workspaces.push(match[1]);
                });
                res(workspaces);
            });
        });
    }
}

module.exports = AgentRunner;
