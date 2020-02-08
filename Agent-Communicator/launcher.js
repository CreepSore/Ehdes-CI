"use strict";
const MockApiHandler = require("./handler/mock-api-handler");
const ConfigParser = require("./handler/config-parser");
const KeyStorage = require("./handler/key-storage");
const Communicator = require("./handler/communicator");


const main = function() {
    let storage = new KeyStorage();
    storage.registerObject("CFG", new ConfigParser(`${__dirname}/config.json`));
    storage.registerObject("API", new MockApiHandler(storage));

    let communicator = new Communicator(storage);
    communicator.start();
};


main();
