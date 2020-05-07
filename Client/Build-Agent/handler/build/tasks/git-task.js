"use strict";
const childprocess = require("child_process");
const path = require("path");
const fs = require("fs");

const ITaskInterface = require("./task-interface");
const RuleRunner = require("../rules/rule-runner");
const RuleFactory = require("../rules/rule-factory");

class ShellTask extends ITaskInterface {
    constructor(buildHandler, task) {
        super("ShellTask", buildHandler, task);
    }

    run() {
        return new Promise((res) => {
            this._logger.info("Started Task", `run/${this._task.label}`);
            let pvar = this._buildHandler.workspace.path;
            let stdout = childprocess.execSync(`git -C "${pvar}" ${this._task.args[0]}`, {
                stdio: "pipe"
            });
            fs.writeFileSync(path.join(this._buildHandler.outpath, `${this._task.label}.stdout.log`), stdout.toString());
            fs.appendFileSync(path.join(this._buildHandler.outpath, "full.stdout.log"), `>>> TASK ${this._task.label}\r\n\r\n${stdout.toString()}\r\n`);
            if(this._task.rules) {
                let rules = this._task.rules.sort((a, b) => {
                    if(a.prio < b.prio) return -1;
                    if(a.prio > b.prio) return 1;
                    return 0;
                });
                let cont = true;
                rules.forEach(rule => {
                    if(!cont) return;
                    this._logger.info(`Running Rule ${rule.prio}`);
                    cont = new RuleRunner(RuleFactory.constructRule({text: stdout.toString()}, this._buildHandler, this._task, rule)).run();
                    this._logger.info(`Finished Rule ${rule.prio}: ${cont ? "success" : "fail"}`);
                });
            }

            this._logger.info("Finished Task", `run/${this._task.label}`);
            res(true);
        });
    }

    static verifyTask(task) {
        if(task.args.length === 0) return 50000;
        return 0;
    }
}

module.exports = ShellTask;
