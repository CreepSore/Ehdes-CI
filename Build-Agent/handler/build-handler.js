"use strict";

const childprocess = require("child_process");

class Builder {
    constructor(workspace, buildfile, outpath) {
        this.workspace = workspace;
        this.buildfile = buildfile;
        this.outpath = outpath;

        this.next = this.workspace["default-build-task"];
    }

    getTaskByLabel(label) {
        let filter = this.buildfile.filter(task => {
            return task.label === label;
        });

        if(filter.length === 1) return filter[0];
        return false;
    }

    run() {
        let currentTask = this.getTaskByLabel(this.next);

        this.runTask(currentTask);

        if(currentTask.after) {
            this.next = currentTask.after;
            return this.run();
        }

        return true;
    }

    runTask(task) {
        if(!task) return;

        switch(task["build-type"]) {
            case "shell": {
                this.runShellTask(task);
                break;
            }

            default: {
                console.log(`Invalid Task Build-Type '${task["build-type"]}'`);
                break;
            }
        }
    }

    runShellTask(task) {
        if(task.args.length === 0) {
            console.log(`Failed to run Task ${task.label}: Invalid Argument length`);
            return;
        }
        let path = this.replacePathVariables(task.args[0]);
        console.log(`[${task.label}] Executing [${path}]`);
        childprocess.execSync(path);
    }

    replacePathVariables(path) {
        let result = path;
        result = result.replace(/\${WORKSPACE}/g, this.workspace.path);
        return result;
    }
}

module.exports = Builder;
