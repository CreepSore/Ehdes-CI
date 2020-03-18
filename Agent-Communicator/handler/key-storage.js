"use strict";

class KeyStorage {
    /**
     * @param {String} name The identifier of this storage object
     */
    constructor(name) {
        if(!name) {
            throw new Error("[KeyStorage] Tried to create KeyStorage without name");
        }

        this.name = name;
        this._entries = {};
    }

    /**
     * @description Gets a registered object by its key
     * @param {String} key The key of the requested object
     * @param {*} defaultObj The object to return, if there is no object with such key
     */
    getObject(key, defaultObj = undefined) {
        let o = this._entries[key];
        if(!o) {
            if(defaultObj !== undefined) {
                return defaultObj;
            }
            throw new Error(`[KeyStorage] Unknown Object with key '${key}' requested in ${this.name}`);
        }
        return o;
    }

    /**
     * @description Gets a registered object by its key
     * @param {String} key The key of the requested object
     * @param {*} defaultObj The object to return, if there is no object with such key
     */
    get(key, defaultObj = undefined) {
        return this.getObject(key, defaultObj);
    }

    /**
     * @description Registers an object
     * @param {String} key The key of the object that you want to register
     * @param {*} object The object that you want to register
     * @param {Boolean} overwrite Defines if the object should be overwritten, if it already exists
     */
    registerObject(key, object, overwrite = false) {
        if(this._entries[key] && !overwrite) {
            throw new Error(`Object with key '${key}' already exists in ${this.name}`);
        }
        this._entries[key] = object;
    }

    /**
     * @description Registers an object without overriding it
     * @param {String} key The key of the object that you want to register
     * @param {*} object The object that you want to register
     */
    register(key, object) {
        this.registerObject(key, object);
    }
}

module.exports = KeyStorage;
