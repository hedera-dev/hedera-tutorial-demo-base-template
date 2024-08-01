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
        case 'update-init':
            await updateInit();
            break;
        case 'scaffold-task':
            await scaffoldTask();
            break;
        default:
            console.error('Unrecognised sub-command:', subCmd);
            break;
    };
}

async function updateUtil() {
    await copyFilesFromTemplateToCwd('util', ['util.js']);
}

async function updateInit() {
    await copyFilesFromTemplateToCwd('init', [
        '00-main.sh',
        '01-dotenv-app.js',
        '02-dotenv-rpcrelay.js',
        '03-get-dependencies.sh',
        '04-rpcrelay-run.sh',
        '05-rpcrelay-smoketest.sh',
        '06-metrics-topic.js',
        '08-metrics-stats.js',
    ]);
}

async function scaffoldTask() {
    const taskId = process.argv[3] || 'unnamedTask';
    const scriptFunctionName = 'script' + taskId[0].toUpperCase() + taskId.slice(1);

    // mkdir if doesn't exist
    await fs.mkdir(path.resolve(processCwd, taskId), { recursive: true });

    // verbatim copy of file
    let fromFilePath = path.resolve(__dirname, '..', 'demo-task', 'package.json');
    let toFilePath = path.resolve(processCwd, taskId, 'package.json');
    await fs.copyFile(fromFilePath, toFilePath);

    // copy of file with replacements
    fromFilePath = path.resolve(__dirname, '..', 'demo-task', 'script-demo.js');
    toFilePath = path.resolve(processCwd, taskId, `script-${taskId}.js`);
    const fileContentsBuffer = await fs.readFile(fromFilePath);
    let fileContents = fileContentsBuffer.toString('utf8');
    fileContents = fileContents
        .replace(/__SCRIPTID__/g, taskId)
        .replace(/__SCRIPTFUNCTIONNAME__/g, scriptFunctionName);
    await fs.writeFile(toFilePath, fileContents);
    await fs.chmod(toFilePath, '755');
}

async function copyFilesFromTemplateToCwd(subdir, fileNamesFrom, fileNamesTo) {
    const fromSubdir = path.resolve(__dirname, '..', subdir);
    const toSubdir = path.resolve(processCwd, subdir);
    const fileCopyPromises = fileNamesFrom.map((fileNameFrom, idx) => {
        const fileNameTo = fileNamesTo?.[idx] || fileNameFrom;
        const fromFilePath = path.resolve(fromSubdir, fileNameFrom);
        const toFilePath = path.resolve(toSubdir, fileNameTo);
        return fs.copyFile(fromFilePath, toFilePath);
    });
    await Promise.all(fileCopyPromises);
}

hederaTutorialDemoBaseTemplateRun();
