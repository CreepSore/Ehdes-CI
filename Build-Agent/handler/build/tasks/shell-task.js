"use strict";
const childprocess = require("child_process");
const path = require("path");
const fs = require("fs");

let ITaskInterface = require("./task-interface");

class ShellTask extends ITaskInterface {
    constructor(buildHandler, task) {
        super("ShellTask", buildHandler, task);
    }

    run() {
        return new Promise((res) => {
            this._logger.info("Started Build", `run/${this._task.label}`);
            let pvar = this._buildHandler.replacePathVariables(this._task.args[0]);
            let stdout = childprocess.execSync(pvar, {
                stdio: "pipe"
            });
            fs.writeFile(path.join(this._buildHandler.outpath, `${this._task.label}.stdout.log`), stdout.toString(), () => {});
            fs.appendFile(path.join(this._buildHandler.outpath, "full.stdout.log"), stdout.toString(), () => {});
            if(this._task.rules) {
                // TODO: Running rules
            }

            this._logger.info("Finished Build", `run/${this._task.label}`);
            res();
        });
    }

    static verifyTask(task) {
        if(task.args.length === 0) return 50000;
        return 0;
    }
}

module.exports = ShellTask;
