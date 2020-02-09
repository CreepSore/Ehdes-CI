"use strict";

const fs = require("fs");
const childprocess = require("child_process");
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

        let gitHead;
        if(fs.existsSync(`${this.workspace.path}/.git/HEAD`)) {
            gitHead = fs.readFileSync(`${this.workspace.path}/.git/HEAD`).toString().match("ref: refs/heads/(.*)")[1];
        }

        let summary = {
            workspace: this.workspace,
            success: result,
            buildtime: time,
            date: starttime,
            gitBranch: gitHead
        };
        fs.writeFileSync(path.join(this.outpath, "summary.json"), JSON.stringify(summary, null, 4));

        console.log(JSON.stringify({
            logtype: "summary",
            summary: summary
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

        let result;
        switch(task["build-type"]) {
            case "shell": {
                result = this.runShellTask(task);
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

    runShellTask(task) {
        if(task.args.length === 0) {
            console.log(JSON.stringify({
                logtype: "task-failure",
                message: `Failed to run Task ${task.label}: Invalid Argument length`
            }));
            return {success: false, rule: -1};
        }
        let path = this.replacePathVariables(task.args[0]);
        console.log(JSON.stringify({
            logtype: "status-changed",
            message: `[${task.label}] Executing [${path}]`
        }));

        let stdout = childprocess.execSync(path);
        fs.writeFileSync(`${this.outpath}/${task.label}.stdout.log`, stdout.toString());
        fs.appendFileSync(`${this.outpath}/full.stdout.log`, stdout.toString());
        if(task.rules) {
            let result = this.handleStdoutRules(stdout, task.rules);

            if(result) {
                return result;
            }
            return {success: false, rule: -1};
        }
        return {success: true, rule: -1};
    }

    handleStdoutRules(stdout, rules) {
        let stdoutRules = rules.filter(rule => {
            return rule.ruletype === "stdout";
        });

        stdoutRules.sort((a, b) => {
            if(a.prio < b.prio) return -1;
            if(a.prio > b.prio) return 1;
            return 0;
        });

        let result;
        for(let i = 0; i < stdoutRules.length; i++) {
            let rule = stdoutRules[i];
            let onmatch = "success";
            let onfail = "ignore";
            let matchtype = "contains";
            let findstring;

            if(rule.onmatch) onmatch = rule.onmatch;
            if(rule.onfail) onfail = rule.onfail;
            if(rule.matchtype) matchtype = rule.matchtype;
            if(!rule.findstring) continue;

            findstring = new RegExp(rule.findstring);

            let matched;
            switch(matchtype) {
                case "contains": {
                    matched = stdout.toString().match(findstring);
                    break;
                }

                default:
                    matched = false;
                    break;
            }

            if(matched) {
                switch(onmatch) {
                    case "success": {
                        result = {success: true, rule: rule.prio};
                        break;
                    }

                    case "fail": {
                        result = {success: false, rule: rule.prio};
                        break;
                    }

                    case "ignore": {
                        break;
                    }

                    default: {
                        break;
                    }
                }
            }
            else {
                switch(onfail) {
                    case "success": {
                        result = {success: true, rule: rule.prio};
                        break;
                    }

                    case "fail": {
                        result = {success: false, rule: rule.prio};
                        break;
                    }

                    case "ignore": {
                        break;
                    }

                    default: {
                        break;
                    }
                }
            }

            if(result) {
                break;
            }
        }

        return result;
    }

    replacePathVariables(path) {
        let result = path;
        result = result.replace(/\${WORKSPACE}/g, this.workspace.path);
        return result;
    }
}

module.exports = Builder;
