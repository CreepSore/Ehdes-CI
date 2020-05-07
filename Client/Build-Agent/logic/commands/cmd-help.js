"use strict";

const ConfigParser = require("../../handler/config-parser");

module.exports = function() {
    let packageParser = new ConfigParser(`${__dirname}/../../../package.json`);
    console.log(`Ehdes-CI: Build-Agent v${packageParser.getConfig().version}`);
    return {success: true};
};
