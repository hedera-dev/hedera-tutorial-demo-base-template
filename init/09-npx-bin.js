#!/usr/bin/env node

const process = require('node:process');

async function hederaTutorialDemoBaseTemplateRun() {
    console.log('hederaTutorialDemoBaseTemplateRun', process.argv);
    const processCwd = process.cwd();
    console.log({
        __dirname,
        __filename,
        processCwd,
    });
}

hederaTutorialDemoBaseTemplateRun();
