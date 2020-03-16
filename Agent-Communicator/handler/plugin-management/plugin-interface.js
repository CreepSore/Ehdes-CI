// @ts-nocheck
"use strict";

// eslint-disable-next-line no-unused-vars
const KeyStorage = require("../key-storage");


class IBasicPlugin {
    /**
     * @param {KeyStorage} storage
     */
    constructor(storage) {
        this.storage = storage;
        if(!this.storage) throw new Error("[IBasicPlugin] No valid Storage System found.");

        /**
         * this.getInformation should return a Object that's built like this:
         * {
         *      author: "Plugin Author",
         *      name: "Example Plugin",
         *      version: "1.0.0",
         *      description: "Example Plugin for testing purposes",
         *      type: "Acom"
         * }
         */
        if(!this.getInformation) throw new Error("[IBasicPlugin] No \"getInformation\" implemented.");
        let info = this.getInformation();
        if(!info.author || !info.name || !info.version || !info.type) {
            throw new Error("[IBasicPlugin] Insufficient values specified inside \"getInformation\"!");
        }

        this.storage = storage;
    }

    onEnable() { }
    onDisable() { }
    getInformation() { }
}

module.exports = IBasicPlugin;
