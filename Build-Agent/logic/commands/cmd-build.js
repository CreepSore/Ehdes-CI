"use strict";

const fs = require("fs");

// eslint-disable-next-line no-unused-vars
const ArgumentParser = require("../../handler/argument-parser");
const WorkspaceHandler = require("../../handler/workspace-handler");
const Builder = require("../../handler/build/build-handler");


/**
 * @param {ArgumentParser} args
 */
let build = function(args) {
    let workspace = WorkspaceHandler.getWorkspaceInfo(args.getValue("workspace"));
    let out = args.getValue("out");
    let buildfile = args.getValue("buildfile");

    if(!workspace) {
        return {success: false, error: "Invalid Workspace specified!"};
    }

    if(buildfile) {
        if(!fs.existsSync(buildfile)) {
            return {success: false, error: "Invalid Buildfile specified!"};
        }
        buildfile = JSON.parse(fs.readFileSync(buildfile).toString());
    }
    else {
        buildfile = WorkspaceHandler.getWorkspaceBuildScript(workspace.name);
    }

    if(!buildfile) {
        return {success: false, error: "No Buildfile found!"};
    }

    if(!out) {
        out = `${workspace.path}/out/`;
        if(!fs.existsSync(out)) {
            fs.mkdirSync(out);
        }
    }

    new Builder(workspace, buildfile, out).build().then(() => {
        process.exit(0);
    });
    return true;
};

module.exports = build;
