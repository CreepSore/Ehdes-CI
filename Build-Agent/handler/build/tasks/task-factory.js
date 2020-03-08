"use strict";

const Logger = require("../../logger");

class TaskFactory {
    static constructTask(buildHandler, task) {
        let loglevel = buildHandler.workspace.loglevel;
        if(!loglevel) loglevel = [];

        let label = task.label;
        let logger = new Logger("TaskFactory", loglevel, true);
        let verify = this.verifyTask(task);

        if(verify === 0) {
            switch(task["build-type"]) {
                case "shell": return this.constructShellTask(buildHandler, task, logger);
                case "git": return this.constructGitTask(buildHandler, task);
                default: {
                    logger.warn(`Invalid Build-Type '${task["build-type"]}' found!`, "constructTask");
                    return false;
                }
            }
        }

        switch(verify) {
            case 100: logger.error("No Label provided!", `verifyTask/${buildHandler.workspace.name}`); break;
            case 200: logger.error("No Build-Type provided!", `verifyTask/${label}`); break;
            case 300: logger.error("No Arguments provided!", `verifyTask/${label}`); break;

            default: break;
        }
        return false;
    }

    static constructGitTask(buildHandler, task/* , logger */) {
        const GitTask = require("./git-task");
        return new GitTask(buildHandler, task);
    }

    static constructShellTask(buildHandler, task, logger) {
        const ShellTask = require("./shell-task");
        let label = task.label;

        switch(ShellTask.verifyTask(task)) {
            case 0: return new ShellTask(buildHandler, task);
            case 50000: logger.error("Argument-Length is 0!", `verifyTask/${label}/ShellTask`); break;
            default: return false;
        }

        return false;
    }

    static verifyTask(task) {
        if(!task.label) return 100;
        if(!task["build-type"]) return 200;
        if(!task.args) return 300;

        return 0;
    }
}

module.exports = TaskFactory;
