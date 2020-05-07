"use strict";
const readline = require("readline");
const EventEmitter = require("events");

module.exports = class InputHandler extends EventEmitter {
    constructor(storage) {
        super();
        this.storage = storage;
        this._nextId = 0;
    }

    start() {
        this._rl = readline.createInterface(
            process.stdin,
            process.stdout
        );

        this.storage.register("INPUT_HANDLER.RL", this._rl);

        this._rl.on("line", inp => {
            let cmdHandler = this.storage.get("CMD_HANDLER");
            let args = inp.split(" ");
            let cmd = args.splice(0, 1)[0];

            this.emit("raw-line", inp);
            this.emit("pre-exec", {id: this._nextId, command: cmd, args: args});
            cmdHandler.trigger(cmd, args);
            this.emit("post-exec", {id: this._nextId, command: cmd, args: args});

            this._nextId++;
        });
    }
};
