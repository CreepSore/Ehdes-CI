"use strict";

const WorkspaceHandler = require("../../handler/workspace-handler");

let trigger = function() {
    let workspaces = WorkspaceHandler.getRegisteredWorkspaces();

    workspaces.forEach(workspace => {
        console.log(`${workspace.label} -> ${workspace.file}`);
    });

    return {success: true};
};

module.exports = trigger;
