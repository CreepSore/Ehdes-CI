"use strict";

class Logger {
    constructor(name, options, defaultJson = false) {
        this.name = name;
        this.options = options;
        this.defaultJson = defaultJson;
        if(Array.isArray(this.options)) {
            this.options = this.options.join("|");
        }
    }

    debug(msg, context, asJson = this.defaultJson) {
        this.log(msg, context, "DEBUG", asJson);
    }

    info(msg, context, asJson = this.defaultJson) {
        this.log(msg, context, "INFO", asJson);
    }

    error(msg, context, asJson = this.defaultJson) {
        this.log(msg, context, "ERROR", asJson);
    }

    warn(msg, context, asJson = this.defaultJson) {
        this.log(msg, context, "WARN", asJson);
    }

    fatal(msg, context, asJson = this.defaultJson) {
        this.log(msg, context, "FATAL", asJson);
    }

    log(msg, context, level, asJson) {
        if (this.options.split("|").filter(e => e === level).length === 1) {
            if(asJson) {
                console.log(JSON.stringify({date: new Date().toISOString(), level: level, context: context, message: msg}));
            }
            else {
                console.log(`[${new Date().toISOString()}][${level.padStart(5)}][${context}] ${msg}`);
            }
        }
    }
}

module.exports = Logger;
