#!/bin/bash
screen -dmS CI-WI node Web-Interface/app.js
screen -dmS CI-ACOM node Agent-Communicator/launcher.js
