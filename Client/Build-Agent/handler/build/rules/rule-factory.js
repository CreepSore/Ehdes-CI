"use strict";

const Logger = require("../../logger");

class RuleFactory {
    static constructRule(args, buildHandler, task, rule) {
        let loglevel = buildHandler ? buildHandler.workspace.loglevel : [];

        let label = rule.prio;
        let logger = new Logger("RuleFactory", loglevel, true);
        let verify = this.verifyRule(rule);

        if(verify === 0) {
            switch(rule.ruletype) {
                case "stdout": return this.constructTextRule(args, buildHandler, task, rule, logger);
                default: {
                    logger.warn(`Invalid Rule-Type '${rule.ruletype} specified!'`, "constructRule");
                    return false;
                }
            }
        }

        switch(verify) {
            case 100: logger.error("No prio provided!", `verifyRule/${buildHandler.workspace.name}`); break;
            case 200: logger.error("No ruletype provided!", `verifyRule/${label}`); break;

            default: break;
        }
        return false;
    }

    static constructTextRule(args, buildHandler, task, rule, logger) {
        const TextRule = require("./text-match-rule");
        let label = rule.prio;

        switch(TextRule.verifyRule(rule)) {
            case 0: return new TextRule(args, buildHandler, task, rule);
            case 50000: logger.error("Argument-Length is 0!", `verifyTask/${label}/ShellTask`); break;
            default: return false;
        }

        return false;
    }

    static verifyRule(rule) {
        if(rule.prio === undefined) return 100;
        if(!rule.ruletype) return 200;
        return 0;
    }
}

module.exports = RuleFactory;
