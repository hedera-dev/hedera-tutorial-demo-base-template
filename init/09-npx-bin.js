#!/usr/bin/env node

const process = require('node:process');
const path = require('node:path');
const fs = require('node:fs/promises');

const processCwd = process.cwd();
const processArgv = process.argv;

async function hederaTutorialDemoBaseTemplateRun() {
    console.log('hederaTutorialDemoBaseTemplateRun');
    console.log({
        __dirname,
        __filename,
        processCwd,
        processArgv,
    });
    const subCmd = process.argv[2];
    switch (subCmd) {
        case 'update-util':
            await updateUtil();
            break;
        default:
            console.error('Unrecognised sub-command:', subCmd);
            break;
    };
}

async function updateUtil() {
    const fromFilePath = path.resolve(__dirname, '../util/util.js');
    const toFilePath = path.resolve(processCwd, './util/util.js');
    await fs.copyFile(fromFilePath, toFilePath);
}

hederaTutorialDemoBaseTemplateRun();
