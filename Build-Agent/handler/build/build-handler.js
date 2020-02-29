"use strict";

const fs = require("fs");
const path = require("path");

class Builder {
    constructor(workspace, buildfile, outpath) {
        this.workspace = workspace;
        this.buildfile = buildfile;
        this.outpath = path.join(outpath, new Date().toISOString().replace(/:|\.|-/g, "_"));

        this.next = this.workspace["default-build-task"];
    }

    getTaskByLabel(label) {
        let filter = this.buildfile.filter(task => {
            return task.label === label;
        });

        if(filter.length === 1) return filter[0];
        return false;
    }

    build() {
        let starttime = new Date();
        let result = this.run();
        let endtime = new Date();
        let time = Number(endtime) - Number(starttime);

        let summary = {
            workspace: this.workspace,
            buildfile: this.buildfile,
            success: result,
            buildtime: time,
            date: starttime
        };
        fs.writeFileSync(path.join(this.outpath, "summary.json"), JSON.stringify(summary, null, 4));

        console.log(JSON.stringify({
            logtype: "summary",
            summary: summary,
            buildfile: this.buildfile
        }));

        return result;
    }

    run() {
        if(!fs.existsSync(this.outpath)) {
            fs.mkdirSync(this.outpath);
        }
        let currentTask = this.getTaskByLabel(this.next);

        let result = this.runTask(currentTask);
        if(!result) {
            return false;
        }

        if(currentTask.after) {
            this.next = currentTask.after;
            return this.run();
        }

        return result;
    }

    runTask(task) {
        if(!task) return true;

        let result = {};
        switch(task["build-type"]) {
            case "shell": {
                // result = this.runShellTask(task);
                break;
            }

            default: {
                console.log(JSON.stringify({
                    logtype: "invalid-task",
                    message: `Invalid Task Build-Type '${task["build-type"]}'`
                }));
                return false;
            }
        }

        if(result && result.rule !== -1) {
            if(!result.success) {
                console.log(JSON.stringify({
                    logtype: "rule-finished",
                    message: `[${task.label}] Rule ${result.rule} failed.`,
                    success: false
                }));
            }
            else {
                console.log(JSON.stringify({
                    logtype: "rule-finished",
                    message: `[${task.label}] Rule ${result.rule} succeeded.`,
                    success: true
                }));
            }
        }
        return result.success;
    }


    replacePathVariables(pth) {
        let result = pth;
        let options = this.workspace.pathKvp;
        if(!options) options = [];

        options.push({key: "WORKSPACE", value: this.workspace.path});
        options.forEach(o => {
            let regex = new RegExp(`[^\\]\${${o.key}}`, "g");
            result = result.replace(regex, o.value);
        });
        return result;
    }
}

module.exports = Builder;
