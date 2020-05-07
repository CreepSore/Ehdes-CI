#!/bin/bash
screen -dmS CI-WI node Client/Web-Interface/app.js
screen -dmS CI-ACOM node Client/Agent-Communicator/launcher.js
