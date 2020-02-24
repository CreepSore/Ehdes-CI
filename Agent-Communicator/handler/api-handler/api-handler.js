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
                        },
                        qs: {
                            secret: this.config.controller.secret
                        }
                    }, (e, r, b) => {
                        if(e) {
                            rej(e);
                            return;
                        }

                        try {
                            let body = JSON.parse(b);
                            if(!body.success) {
                                rej(body.error);
                                return;
                            }
                        }
                        catch (ex) {
                            rej();
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
                },
                qs: {
                    secret: this.config.controller.secret
                }
            }, (e, r, b) => {
                if(e) {
                    rej(e);
                    return;
                }

                try {
                    let body = JSON.parse(b);
                    if(!body.success) {
                        rej(body.error);
                        return;
                    }
                }
                catch (ex) {
                    rej(ex);
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
                    uuid: this.config.uuid,
                    secret: this.config.controller.secret
                }
            }, (e, r, b) => {
                if(e) {
                    rej(e);
                    return;
                }

                try {
                    let body = JSON.parse(b);
                    res(body);
                }
                catch (ex) {
                    rej(ex);
                }
            });
        });
    }
}

module.exports = ApiHandler;
