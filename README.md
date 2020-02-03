# Ehdes-CI

This is the description file of the Ehdes-CI Build-Agent.
The here specified Application is a Component of the Ehdes Continuous Integration Toolset.

---

## Background
While there are a lot of CI-Tools out there, I still prefer to challenge myself to tasks like this. There may be many tools out there, which work better than this Application, yet I like to make and use my own.  
The main goal of this Project is to make a CI-Tool which is able to test Bootloader-/ and Kernel-Loading while still providing tools to build general Apps.

## Technologies
The main-technologies used in this Project are NodeJS for the Build-Agent and PHP for the Web-Frontend. While it seems counter-productive to not use NodeJS for the frontend too, I prefer using PHP because of its simplicity.

## Structure
Because of maintenance reasons, the Application is built up from several programs, which each represent one layer.
The core of the Application is the Build-Agent, which is dynamically configurable by JSON files.  
Example Build-Config:
```JSON
[
    {
        "label": "build-main",
        "after": "build-script",
        "build-type": "shell",
        "args": [
            "${PATH_COMPILERS}/gcc/gcc ${WORKSPACE}/main.c -o ${WORKSPACE}/build/main.bin"
        ],
    },
    {
        "label": "build-script",
        "after": "run",
        "build-type": "shell",
        "args": [
            "${WORKSPACE}/build.sh"
        ]
    }
]
```
`node ci-agent build workspace=TEST-WORKSPACE`  
This command will build the Workspace with the name "TEST-WORKSPACE" using the ".ehdes-ci.json" file inside the Workspace Root. The output will be saved inside the "build" folder inside the Workspace Root.

`node ci-agent build workspace=TEST-WORKSPACE buildfile="/home/testuser/buildscripts/build.json" out="/home/testuser/buildresults/TEST-WORKSPACE"`  
This command will build the Workspace with the name "TEST-WORKSPACE" using the "build.json" file inside the "/home/testuser/buildscripts/" folder. The output will be saved into "/home/testuser/buildresults/TEST-WORKSPACE/".

