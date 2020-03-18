/* eslint-disable no-unused-vars */
// @ts-nocheck
"use strict";

class IWiPlugin extends require("./plugin-interface"){
    constructor(storage) {
        super(storage);
    }

    onExpressInit(app) { }
}

module.exports = IWiPlugin;
