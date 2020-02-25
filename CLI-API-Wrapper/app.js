"use strict";
const path = require("path");

const InputHandler = require("./logic/input-handler");
const ConfigHandler = require("./logic/config-handler");
const KeyStorage = require("./logic/key-storage");
const ArgumentParser = require("./logic/argument-parser");
const CommandHandler = require("./commands/command-handler");

let inputHandler;
let argumentParser;
let cmdHandler;
let cfgHandler;

let storage = new KeyStorage("GENERAL");

const init = function(first) {
    if(first) {
        process.argv.splice(0, 2);
        argumentParser = storage.register("ARG_PARSER", new ArgumentParser(process.argv));
        cmdHandler = storage.register("CMD_HANDLER", CommandHandler.createDefault(storage, false));
        cfgHandler = storage.register("CFG_HANDLER", new ConfigHandler(path.join(__dirname, "config.json")));
    }

    storage.registerObject("CFG", storage.get("CFG_HANDLER").getConfig(), true);

    if(process.argv.length - process.argv.filter(s => s.startsWith("--")).length === 0) {
        cfgHandler
            .on("change", () => {
                console.log("Imported new Config");
                init(false);
            });
        cfgHandler.watch();

        inputHandler = storage.register("INPUT_HANDLER", new InputHandler(storage));
        inputHandler.start();
    }
    else {
        let cmd = argumentParser.getValue(0);
        let args = argumentParser.values.slice(1);

        cmdHandler.trigger(cmd, args);
    }
};

init(true);
