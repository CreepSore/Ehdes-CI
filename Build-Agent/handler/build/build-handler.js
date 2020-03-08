"use strict";
const fs = require("fs");
const path = require("path");

const Logger = require("../logger");
const taskFactory = require("./tasks/task-factory");

class Builder {
    constructor(workspace, buildfile, outpath) {
        this.workspace = workspace;
        this.buildfile = buildfile;
        this.outpath = path.join(outpath, new Date().toISOString().replace(/:|\.|-/g, "_"));
        this.logger = new Logger("BuildHandler", this.workspace.loglevel, true);

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
        return new Promise(res => {
            let starttime = new Date();

            let preTasks = this.workspace.preTasks;
            if(preTasks) {
                preTasks.forEach((taskData, i) => {
                    let task = taskFactory.constructTask(this, taskData);
                    if(task) {
                        task.run();
                        if(i === preTasks.length - 1) {
                            this.run().then(result => {
                                this.finishBuild(starttime, result);
                                res(result);
                            });
                        }
                    }
                });

                return;
            }

            this.run().then(result => {
                this.finishBuild(starttime, result);
                res(result);
            });
        });
    }

    finishBuild(starttime, result) {
        let time = Number(new Date()) - Number(starttime);

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
    }

    async run() {
        if(!fs.existsSync(this.outpath)) {
            fs.mkdirSync(this.outpath);
        }
        let taskData = this.getTaskByLabel(this.next);
        let task = taskFactory.constructTask(this, taskData);
        if(!task) {
            this.logger.warn(`Invalid Task-Data: ${this.next}`);
            return false;
        }


        let result = await task.run();

        if(!result) {
            return false;
        }

        if(taskData.after) {
            this.next = taskData.after;
            return this.run();
        }
        return true;
    }

    replacePathVariables(pth) {
        let result = pth;
        let options = this.workspace.pathKvp;
        if(!options) options = [];

        options.push({key: "WORKSPACE", value: this.workspace.path});
        options.push({key: "OUT", value: this.outpath});
        options.forEach(o => {
            let regex = new RegExp(`[^\\\\]\\\${${o.key}}`, "g");
            result = result.replace(regex, ` ${o.value}`);
        });
        return result;
    }
}

module.exports = Builder;
