"use strict";
const fs = require("fs");
const path_ = require("path");

// eslint-disable-next-line no-unused-vars
const IBasicPlugin = require("./plugin-interface");
const KeyStorage = require("../key-storage");

class PluginManager {
    /**
     * @param {KeyStorage} storage
     */
    constructor(storage) {
        this.storage = storage ? storage : new KeyStorage("PLUGIN_MGR");
        this.pluginPaths = this.storage.get("PLUGIN_MGR.PATHS", []);
        this.plugins = [];

        this.storage.registerObject("PLUGIN_MGR.PATHS", this.pluginPaths, true);
        this.storage.register("PLUGIN_MGR.PLUGINS", this.plugins);
    }

    /**
     * @description Registers a path that will be used to search for modules
     * @param {String} path
     */
    registerPath(path) {
        let realPath = path.startsWith("/") ? path : path_.join(this.storage.get("BASE_PATH"), path);
        if(!fs.existsSync(realPath)) {
            return false;
        }
        this.pluginPaths.push(realPath);
        return this.pluginPaths.length - 1;
    }

    /**
     * @description Loads the plugins inside the registered Paths
     */
    loadPlugins() {
        this.pluginPaths.forEach(path => {
            let dir = fs.readdirSync(path);
            dir.forEach(file => {
                let finalPath = path_.join(path, file);
                let query = fs.lstatSync(finalPath);
                if(!query.isFile()) {
                    return;
                }

                let Plugin = require(finalPath);
                let plugin = new Plugin(this.storage);
                this.plugins.push(plugin);
                plugin.onEnable();
            });
        });
    }

    /**
     * @description Unloads all loaded plugins
     */
    unloadPlugins() {
        this.plugins.forEach(plugin => {
            plugin.onDisable();
            this.plugins.splice(this.plugins.indexOf(plugin), 1);
        });
    }

    /**
     * @description Unloads all loaded Plugins and reloads all plugins
     */
    reloadPlugins() {
        this.unloadPlugins();
        this.loadPlugins();
    }

    /**
     * @description Executes a Function of all plugins
     * @param {String} functionName
     * @param {*} args
     * @param {String} plugintype The type of plugin to match
     */
    callPluginFunction(functionName, args, plugintype) {
        this.plugins.forEach(plugin => {
            if(!plugintype || plugintype === plugin.getInformation().type) {
                plugin[functionName](args);
            }
        });
    }
}

module.exports = PluginManager;
