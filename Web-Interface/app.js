"use strict";
const expressInit = require("./express/express-init");
const KeyStorage = require("./handler/key-storage");

const storage = new KeyStorage("GENERAL");

const init = function() {
    storage.register("BASE_PATH", __dirname);
    expressInit(storage);
};

init();
