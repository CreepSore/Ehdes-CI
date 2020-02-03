"use strict";
const ArgumentParser = require("./handler/argument-parser");
const CommandHandler = require("./handler/command-handler");

const cmdHelp = require("./logic/commands/cmd-help");

process.argv.splice(0, 2);
let argParser = new ArgumentParser(process.argv);
let cmdHandler = new CommandHandler();

let initCommands = function() {
    cmdHandler.registerCommand("help", cmdHelp);
};

let init = function() {
    initCommands();
    let command = argParser.getValue(0);
    if(command) {
        cmdHandler.triggerCommand(command, argParser);
    }
    else {
        cmdHandler.triggerCommand("help");
    }
};

init();
