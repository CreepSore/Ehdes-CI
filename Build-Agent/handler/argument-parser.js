class ArgumentParser {
    /**
     * @param {Array<String>} array
     */
    constructor(array) {
        this.arguments = array;
        this.values = {};
        this.parse();
    }

    parse() {
        this.arguments.forEach(str => {
            let matched = str.match(/(.*?)=(.*)/);
            if(!matched || matched.length != 3) return;

            this.values[matched[1]] = matched[2];
        });
    }

    getValue(key) {
        return this.values[key];
    }
};

module.exports = ArgumentParser;