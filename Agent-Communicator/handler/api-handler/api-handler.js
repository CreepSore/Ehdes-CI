"use strict";
const request = require("request");

const ApiHandlerInterface = require("./api-handler-interface");

class ApiHandler extends ApiHandlerInterface {
    constructor(storage) {
        super(storage);
        this.config = this.storage.getObject("CFG").getConfig();
        this.agent = this.storage.getObject("AGENT");
    }

    register() {
        let url = `${this.config.controller.url}/api/register`;
        return new Promise((res, rej) => {
            this.agent.getWorkspaces()
                .then(workspaces => {
                    request.post(url, {
                        form: {
                            agent: {
                                uuid: this.config.uuid,
                                label: this.config.label,
                                workspaces: workspaces
                            }
                        }
                    }, (e, r, b) => {
                        if(e) {
                            rej(e);
                            return;
                        }

                        let body = JSON.parse(b);
                        if(!body.success) {
                            rej(body.error);
                            return;
                        }

                        res();
                    });
                });
        });
    }

    heartbeat() {
        return this.register();
    }

    pushBuildResult(result) {
        let url = `${this.config.controller.url}/api/buildresults`;
        return new Promise((res, rej) => {
            request.post(url, {
                form: {
                    buildresult: result
                }
            }, (e, r, b) => {
                if(e) {
                    rej(e);
                    return;
                }

                let body = JSON.parse(b);
                if(!body.success) {
                    rej(body.error);
                    return;
                }

                res();
            });
        });
    }

    fetchJobs() {
        let url = `${this.config.controller.url}/api/jobs`;
        return new Promise((res, rej) => {
            request.get(url, {
                qs: {
                    uuid: this.config.uuid
                }
            }, (e, r, b) => {
                if(e) {
                    rej(e);
                    return;
                }

                let body = JSON.parse(b);
                res(body);
            });
        });
    }
}

module.exports = ApiHandler;
