// @ts-nocheck
"use strict";

class RuleInterface {
    constructor(args, buildHandler, task, rule) {
        this._args = args;
        this._buildHandler = buildHandler;
        this._task = task;
        this._rule = rule;

        this.onmatch = this._rule.onmatch ? this._rule.onmatch : "succeed";
        this.onfail = this._rule.onfail ? this._rule.onfail : "ignore";

        if(!this.match) throw new Error("[RuleInterface] this.match not defined");
    }
}

module.exports = RuleInterface;
