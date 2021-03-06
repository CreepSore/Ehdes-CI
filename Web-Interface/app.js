"use strict";
const fs = require("fs");
const path  = require("path");

const expressInit = require("./express/express-init");
const KeyStorage = require("./handler/key-storage");
const PluginManager = require("./handler/plugin-management/plugin-manager");

const storage = new KeyStorage("GENERAL");


const overrideStorage = function(cfg) {
    if(cfg.storageOverrides && Array.isArray(cfg.storageOverrides)) {
        cfg.storageOverrides.forEach(override => {
            if(!override.key) return;
            storage.registerObject(override.key, override.value, true);
        });
    }
};

const initPlugins = function() {
    let pluginmgr = new PluginManager(storage);
    storage.register("PLUGIN_MANAGER", pluginmgr);
    pluginmgr.registerPath("plugins/");
    pluginmgr.loadPlugins();
};

const init = function() {
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json")).toString());
    storage.register("BASE_PATH", __dirname);
    storage.register("CFG", config);
    overrideStorage(config);
    initPlugins();
    expressInit(storage);
};

init();
