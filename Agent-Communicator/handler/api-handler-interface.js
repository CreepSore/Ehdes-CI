// @ts-nocheck
"use strict";

class ApiHandlerInterface {
    constructor(storage) {
        this.storage = storage;

        let missing = [];
        if(!this.register) missing.push("register");
        if(!this.heartbeat) missing.push("heartbeat");
        if(!this.pushBuildResult) missing.push("pushBuildResult");
        if(!this.fetchJobs) missing.push("fetchJobs");

        if(missing.length > 0) {
            throw new Error(`Members ${missing.join(", ")} are not defined!`);
        }
    }
}

module.exports = ApiHandlerInterface;
