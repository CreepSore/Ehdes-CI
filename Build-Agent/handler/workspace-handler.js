"use strict";

const fs = require("fs");
const path = require("path");

class WorkspaceHandler {
    static getRegisteredWorkspaces() {
        let workspaces = [];
        let files = fs.readdirSync(path.join(__dirname, "..", "config", "workspaces"), {encoding: "utf8"});

        files.forEach(file => {
            if(!file.endsWith(".json")) {
                return;
            }

            let workspaceInfo = this.getWorkspaceInfo(file, true);
            workspaces.push({label: workspaceInfo.name, file: file});
        });

        return workspaces;
    }

    static getWorkspaceInfo(name, asFile = false) {
        let ws = name;
        if(!asFile) {
            this.getRegisteredWorkspaces().forEach(workspace => {
                if(workspace.label !== name) {
                    return;
                }

                ws = workspace.file;
            });
        }

        let wpath = path.join(__dirname, "..", "config", "workspaces", ws);
        if(!fs.existsSync(wpath)) {
            return false;
        }

        return JSON.parse(fs.readFileSync(wpath, {encoding: "utf8"}).toString());
    }

    static getWorkspaceBuildScript(name) {
        let workspaceInfo = this.getWorkspaceInfo(name);
        let scriptPath = `${workspaceInfo.path}/.ehdes-ci.json`;

        if(!fs.existsSync(scriptPath)) {
            return false;
        }

        return JSON.parse(fs.readFileSync(scriptPath).toString());
    }
}

module.exports = WorkspaceHandler;
