"use strict";

class RuleRunner {
    constructor(rule) {
        this.rule = rule;
    }

    run() {
        let result = this.rule.match();
        let onMatch = this.rule.onmatch;
        let onFail = this.rule.onfail;

        if(result && onMatch === "success") result = true;
        else if(result && onMatch === "fail") result = false;
        else if(!result && onFail === "success") result = true;
        else if(!result && onFail === "fail") result = false;

        return result;
    }
}

module.exports = RuleRunner;
