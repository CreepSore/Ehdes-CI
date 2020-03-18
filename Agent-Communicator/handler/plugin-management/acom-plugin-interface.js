/* eslint-disable no-unused-vars */
// @ts-nocheck
"use strict";

class IAcomPlugin extends require("./plugin-interface"){
    constructor(storage) {
        super(storage);
    }

    onLoop() { }
    onJobStart(job) { }
    onJobFinished(buildResult) { }
}

module.exports = IAcomPlugin;
