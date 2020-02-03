const ArgumentParser = require("./handler/argument-parser");

let argParser = new ArgumentParser(process.argv);

console.log(argParser.getValue("test"));