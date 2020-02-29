// @ts-nocheck
"use strict";

let Logger = require("../../logger");

class TaskInterface {
    constructor(name, buildHandler, task) {
        this._buildHandler = buildHandler;
        this._task = task;

        let loglevel = buildHandler.workspace.loglevel;
        if(!loglevel) loglevel = [];
        this._logger = new Logger(name, loglevel, true);

        if(!this.run) throw new Error("[ITaskInterface] this.run not declared");
    }
}

module.exports = TaskInterface;
