"use strict";

const fs = require("fs");

class ConfigParser {
    constructor(path) {
        this.path = path;
        if(!fs.existsSync(path)) {
            throw new Error(`Invalid Config-Path specified: File not found [${path}]`);
        }
        this.data = null;
    }

    getConfig() {
        if(this.data === null) {
            this.data = JSON.parse(fs.readFileSync(this.path).toString());
        }

        return this.data;
    }
}

module.exports = ConfigParser;
