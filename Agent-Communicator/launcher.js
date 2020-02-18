"use strict";
const ApiHandler = require("./handler/api-handler/api-handler");
const ConfigParser = require("./handler/config-parser");
const KeyStorage = require("./handler/key-storage");
const Communicator = require("./handler/communicator");
const AgentRunner = require("./handler/agent-runner");

const main = function() {
    let storage = new KeyStorage();
    storage.registerObject("BASE_PATH", __dirname);
    storage.registerObject("CFG", new ConfigParser(`${__dirname}/config.json`));
    storage.registerObject("AGENT", new AgentRunner(storage));
    storage.registerObject("API", new ApiHandler(storage));

    let communicator = new Communicator(storage);
    communicator.start();
};


main();
