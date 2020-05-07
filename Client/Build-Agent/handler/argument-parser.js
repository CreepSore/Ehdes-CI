"use strict";
class ArgumentParser {
    /**
     * @param {Array<String>} array
     */
    constructor(array) {
        this.arguments = array;
        this.values = [];
        this.parse();
    }

    parse() {
        this.arguments.forEach(str => {
            let matched = str.match(/(.*?)=(.*)/);
            if(!matched || matched.length !== 3) {
                this.values.push(str);
                return;
            }

            this.values[matched[1]] = matched[2];
        });
    }

    getValue(key) {
        let num = parseInt(key, 10);
        if(isNaN(num)) {
            return this.values[key];
        }
        return this.values[num];
    }
}

module.exports = ArgumentParser;
