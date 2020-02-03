"use strict";

class CommandHandler {
    constructor() {
        this.commands = [];
    }

    /**
     * @param {String} trigger
     * @param {*} callback
     */
    registerCommand(trigger, callback) {
        this.commands[trigger] = callback;
    }

    /**
     * @param {String} trigger
     * @param {*} args
     */
    triggerCommand(trigger, args = {}) {
        let func = this.getCommand(trigger);
        if(func) {
            return func(args);
        }
        return {success: false, error: "Invalid Command"};
    }

    /**
     * @param {String} trigger
     */
    getCommand(trigger) {
        return this.commands[trigger];
    }
}

module.exports = CommandHandler;
