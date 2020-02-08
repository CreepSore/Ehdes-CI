"use strict";

class KeyStorage {
    constructor() {
        this.storage = {};
    }

    registerObject(key, object) {
        this.storage[key] = object;
    }

    getObject(key) {
        let o = this.storage[key];
        if(o === undefined) {
            throw new Error(`Storage-Object with key '${key}' does not exist!`);
        }
        return o;
    }

    exists(key) {
        return this.storage[key] !== undefined;
    }
}

module.exports = KeyStorage;
