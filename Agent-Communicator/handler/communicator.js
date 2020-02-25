"use strict";

class Communicator {
    constructor(storage) {
        this.storage = storage;
        this.handledJobs = [];
        this.runningJobs = [];
        this.cfg = storage.getObject("CFG");
        this.api = storage.getObject("API");
        this.api_haderror = false;

        this.startTime = Number(new Date());
    }

    connect(onregister) {
        this.api.register()
            .then(() => {
                onregister();
            }).catch(() => {
                this.connect(onregister);
            });
    }

    start() {
        this.log("Started");
        this.heartbeat();
        setInterval(() => { this.heartbeat(); }, 5000);
        setInterval(() => { this._loop(); }, 5000);
    }

    heartbeat() {
        this.api.heartbeat()
            .catch(() => {
                // Do nothing, lol
            });
    }

    _loop() {
        if (this.api_haderror) {
            this.handledJobs = [];
            this.api.register()
                .then(() => {
                    this.api_haderror = false;
                }).catch(() => {
                    this.api_haderror = true;
                });
            return;
        }

        this.api.fetchJobs()
            .then(jobs => {
                jobs.filter(e => {
                    return !this.handledJobs.includes(e.jobid) && !this.runningJobs.includes(e.jobid);
                }).forEach(job => {
                    this.startBuildJob(job);
                });
            }).catch(() => {
                this.api_haderror = true;
            });
    }

    startBuildJob(job) {
        this.runningJobs.push(job.jobid);
        this.log(`Starting job '${job.jobid}'`);

        this.storage.getObject("AGENT").buildWorkspace(job.workspace)
            .then(summary => {
                this.handledJobs.push(job.jobid);
                this.api.pushBuildResult({
                    job: job,
                    summary: summary
                }).then(() => {
                    this.log(`Finished job '${job.jobid}'`);
                }).catch(() => {
                    this.log(`Failed to push job-summary '${job.jobid}'`);
                });
            });
    }

    log(msg) {
        console.log(`[${new Date().toISOString()}][Communicator] ${msg}`);
    }
}

module.exports = Communicator;
