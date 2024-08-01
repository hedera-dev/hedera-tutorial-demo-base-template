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
    await copyFilesFromTemplateToCwd('util', ['util.js']);
}

async function copyFilesFromTemplateToCwd(subdir, fileNames) {
    const fromSubdir = path.resolve(__dirname, '..', subdir);
    const toSubdir = path.resolve(processCwd, subdir);
    const fileCopyPromises = fileNames.map((fileName) => {
        const fromFilePath = path.resolve(fromSubdir, fileName);
        const toFilePath = path.resolve(toSubdir, fileName);
        return fs.copyFile(fromFilePath, toFilePath);
    });
    await Promise.all(fileCopyPromises);
}

hederaTutorialDemoBaseTemplateRun();
