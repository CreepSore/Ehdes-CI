"use strict";
const ApiHandler = require("./handler/api-handler/api-handler");
const PluginManager = require("./handler/plugin-management/plugin-manager");
const ConfigParser = require("./handler/config-parser");
const KeyStorage = require("./handler/key-storage");
const Communicator = require("./handler/communicator");
const AgentRunner = require("./handler/agent-runner");

const initPlugins = function(storage) {
    let pluginMgr = new PluginManager(storage);
    pluginMgr.registerPath("plugins/");
    storage.registerObject("PLUGIN_MGR", pluginMgr);

    pluginMgr.loadPlugins();
};

const main = function() {
    let storage = new KeyStorage("GENERAL");
    storage.registerObject("BASE_PATH", __dirname);
    storage.registerObject("CFG", new ConfigParser(`${__dirname}/config.json`));
    storage.registerObject("AGENT", new AgentRunner(storage));
    storage.registerObject("API", new ApiHandler(storage));
    initPlugins(storage);

    let communicator = new Communicator(storage);
    communicator.start();
};


main();
