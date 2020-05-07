"use strict";

module.exports = function(args) {
    console.log(Array.isArray(args) ? args.join(" ") : "pong");
};
