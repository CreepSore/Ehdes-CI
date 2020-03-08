"use strict";

const RuleInterface = require("./rule-interface");

class TextMatchRule extends RuleInterface {
    constructor(args, buildHandler, task, rule) {
        super(args, buildHandler, task, rule);
    }

    match() {
        let matched = this._rule.findstring.match(/\/(.*)[^\\]*\/(.*)/);
        let regex = new RegExp(matched[1], matched[2]);
        let result = this._args.text.match(regex);
        return result;
    }

    static verifyRule(rule) {
        if(!rule.findstring) return 50000;
        return 0;
    }
}

module.exports = TextMatchRule;
