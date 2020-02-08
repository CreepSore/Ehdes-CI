"use strict";

class Communicator {
    constructor(storage) {
        this.storage = storage;
        this.cfg = storage.getObject("CFG");
        this.api = storage.getObject("API");

        this.startTime = Number(new Date());
    }

    connect(onregister) {
        this.api.register()
            .then(() => {
                onregister();
            }).catch(() => {
                this.connect(onregister);
            });
    }

    start() {
        this.connect(() => {
            this.log("Registered");
            setInterval(() => { this._loop(); }, 100);
        });
    }

    _loop() {

    }

    log(msg) {
        console.log(`[${new Date().toISOString()}][Communicator] ${msg}`);
    }
}

module.exports = Communicator;
