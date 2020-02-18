"use strict";
const MockApiHandler = require("./handler/api-handler/mock-api-handler");
const ConfigParser = require("./handler/config-parser");
const KeyStorage = require("./handler/key-storage");
const Communicator = require("./handler/communicator");
const AgentRunner = require("./handler/agent-runner");

const main = function() {
    let storage = new KeyStorage();
    storage.registerObject("BASE_PATH", __dirname);
    storage.registerObject("CFG", new ConfigParser(`${__dirname}/config.json`));
    storage.registerObject("API", new MockApiHandler(storage));
    storage.registerObject("AGENT", new AgentRunner(storage));

    let communicator = new Communicator(storage);
    communicator.start();
};


main();
