"use strict";

class CommandHandler {
    constructor(storage, ignoreCase = false) {
        this.storage = storage;
        this._commands = [];
        this._ignoreCase = ignoreCase;
    }

    trigger(command, args) {
        let toTrigger = this._commands.filter(c => c.trigger === command
            || (this._ignoreCase && c.trigger.toLower() === command.toLower()));

        args.storage = this.storage;

        toTrigger.forEach(cmd => {
            cmd.action(args);
        });
    }

    registerCommand(trigger, callback) {
        let triggers = Array.isArray(trigger) ? trigger : [trigger];
        triggers.forEach(trg => {
            this._commands.push({
                trigger: trg,
                action: callback
            });
        });
    }

    static createDefault(storage, ignoreCase = false) {
        let commandHandler = new CommandHandler(storage, ignoreCase);

        commandHandler.registerCommand(["echo", "ping"], require("./command-echo"));
        commandHandler.registerCommand(["quit", "exit", "bye", "leave", "kill"], () => process.exit(0));
        commandHandler.registerCommand(["view-storage"], (args) => { console.log(storage.get(args[0])); });
        commandHandler.registerCommand("api", require("./command-api"));

        return commandHandler;
    }
}

module.exports = CommandHandler;
