"use strict";
const fs = require("fs");
const childProcess = require("child_process");

class AgentRunner {
    constructor(storage) {
        this.storage = storage;
        this.agentPath = this.storage.getObject("CFG").getConfig().agent.path;

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
                    if(log.success === false && log.error && log.error === "Invalid Workspace specified!") {
                        res(JSON.stringify({success: false, error: "Invalid Workspace"}));
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
            let lines = [];

            agentproc.stdout.on("data", data => {
                lines.push([... data.toString().split("\n")][0]);
            });

            agentproc.on("exit", () => {
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
