"use strict";

const RuleInterface = require("./rule-interface");

class TextMatchRule extends RuleInterface {
    constructor(args) {
        super(args);
    }

    match() {

    }

    static verifyRule(rule) {
        if(!rule.findstring) return 50000;
        return 0;
    }
}

module.exports = TextMatchRule;
