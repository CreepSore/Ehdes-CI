"use strict";

const ApiHandlerInterface = require("./api-handler-interface");

class MockApiHandler extends ApiHandlerInterface{
    constructor(storage) {
        super(storage);

        this.config = this.storage.getObject("CFG").getConfig();

        // Mock Objects
        this._registeredAgents = [];
        this._jobs = [
            {
                jobid: "6884ef49-060b-402d-9824-cef0d2e0859e",
                agentid: "2409d320-2b30-40f4-917a-177c5b6056ec",
                workspace: "Hitman-2-Hack"
            }
        ];
        this._buildResults = [];
        this._running = true;
    }

    register() {
        return new Promise((res, rej) => {
            let workspaces = [];

            if(this._running) {
                setTimeout(() => {
                    this._registeredAgents.push({
                        uuid: this.config.uuid,
                        workspaces: workspaces
                    });
                    res();
                }, 250 * (Math.random() + 1));
                return;
            }

            rej(1);
        });
    }

    heartbeat() {
        return new Promise((res, rej) => {
            if(this._running) {
                setTimeout(() => {
                    res();
                }, 250 * (Math.random() + 1));
                return;
            }

            rej(1);
        });
    }

    pushBuildResult(buildresult) {
        return new Promise((res, rej) => {
            if(!buildresult) {
                rej(1);
                return;
            }

            if(this._running) {
                setTimeout(() => {
                    this._buildResults.push(buildresult);
                    res(JSON.stringify(buildresult));
                }, 250 * (Math.random() + 1));
                return;
            }

            rej(2);
        });
    }

    fetchJobs() {
        let jobs = this._jobs;
        return new Promise((res, rej) => {
            if(this._running) {
                setTimeout(() => {
                    res(jobs);
                }, 250 * (Math.random() + 1));
                return;
            }

            rej(1);
        });
    }
}

module.exports = MockApiHandler;
