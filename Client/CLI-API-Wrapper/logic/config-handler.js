"use strict";
const fs = require("fs");
const Events = require("events");

module.exports = class ConfigHandler extends Events {
    constructor(path) {
        super();
        this._path = path;
        if(!fs.existsSync(path)) {
            throw new Error(`Invalid Path specified [${path}]`);
        }

        this._parsed = JSON.parse(fs.readFileSync(path).toString());
    }

    watch() {
        fs.watchFile(this._path, (current, previous) => {
            if(current.atime !== previous.atime) {
                try {
                    this._parsed = JSON.parse(fs.readFileSync(path).toString());
                    this.emit("change", this._parsed);
                }
                catch (ex) {
                    console.log(`Failed to read changed Config: ${ex}`);
                }
            }
        });
    }

    getConfig() {
        return this._parsed;
    }
};
