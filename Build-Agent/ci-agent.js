"use strict";
const ArgumentParser = require("./handler/argument-parser");
const CommandHandler = require("./handler/command-handler");

const cmdHelp = require("./logic/commands/cmd-help");
const cmdBuild = require("./logic/commands/cmd-build");
const cmdWorkspaces = require("./logic/commands/cmd-workspaces");

process.argv.splice(0, 2);
let argParser = new ArgumentParser(process.argv);
let cmdHandler = new CommandHandler();

let initCommands = function() {
    cmdHandler.registerCommand("help", cmdHelp);
    cmdHandler.registerCommand("build", cmdBuild);

    cmdHandler.registerCommand("workspaces", cmdWorkspaces);
    cmdHandler.registerCommand("ws", cmdWorkspaces);
};

let init = function() {
    initCommands();
    let command = argParser.getValue(0);

    let result;
    if(command) {
        result = cmdHandler.triggerCommand(command, argParser);
    }
    else {
        result = cmdHandler.triggerCommand("help");
    }
    if(!result.success) {
        console.log(result.error);
    }
};

init();
