#!/usr/bin/env node

const process = require('node:process');
const path = require('node:path');
const fs = require('node:fs/promises');

const processCwd = process.cwd();
const processArgv = process.argv;

async function hederaTutorialDemoBaseTemplateRun() {
    if (process.env.DEBUG) {
        console.log('hederaTutorialDemoBaseTemplateRun');
        console.log({
            __dirname,
            __filename,
            processCwd,
            processArgv,
        });
    }
    const subCmd = process.argv[2];
    switch (subCmd) {
        case 'update':
            await update();
            break;
        case 'scaffold-task':
            await scaffoldTask();
            break;
        default:
            console.error('Unrecognised sub-command:', subCmd);
            break;
    };
}

async function update() {
    console.log('Updating from upstream base template...');
    const rootDirFiles = [
        '.env.sample',
        '.rpcrelay.env.sample',
        'logger.json.sample',
        '.gitpod.yml',
        '.gitignore',
    ];
    const utilDirFiles = [
        'util.js',
        '00-main.sh',
        '01-dotenv-app.js',
        '02-dotenv-rpcrelay.js',
        '03-get-dependencies.sh',
        '04-rpcrelay-run.sh',
        '05-rpcrelay-smoketest.sh',
        '06-metrics-topic.js',
        '08-metrics-stats.js',
    ];
    await copyFilesFromTemplateToCwd('.', rootDirFiles);
    console.log('Copied the following files into the root directory:');
    console.log(rootDirFiles.map((text) => (`- ${text}`)).join('\n'));
    await copyFilesFromTemplateToCwd('util', utilDirFiles);
    console.log('Copied the following files into the "util" directory:');
    console.log(utilDirFiles.map((text) => (`- ${text}`)).join('\n'));
}

async function scaffoldTask() {
    console.log('Generating new task from upstream base template...');
    const taskId = process.argv[3] || 'unnamedTask';
    const scriptIdName = taskId
        .split(/[\s-_]+/g)
        .map((token, index) => {
            if (index === 0) {
                return token; // pass through for first token
            } else {
                return token[0].toUpperCase() + token.slice(1);
            }
        })
        .join('');
    const scriptFunctionName = 'script' + scriptIdName[0].toUpperCase() + scriptIdName.slice(1);
    console.log({ taskId, scriptIdName, scriptFunctionName });

    // mkdir if doesn't exist
    await fs.mkdir(path.resolve(processCwd, scriptIdName), { recursive: true });

    // verbatim copy of file
    let fromFilePath = path.resolve(__dirname, '..', 'demo-task', 'package.json');
    let toFilePath = path.resolve(processCwd, scriptIdName, 'package.json');
    await fs.copyFile(fromFilePath, toFilePath);

    // copy of file with replacements
    fromFilePath = path.resolve(__dirname, '..', 'demo-task', 'script-demo.js');
    toFilePath = path.resolve(processCwd, scriptIdName, `script-${scriptIdName}.js`);
    const fileContentsBuffer = await fs.readFile(fromFilePath);
    let fileContents = fileContentsBuffer.toString('utf8');
    fileContents = fileContents
        .replace(/__SCRIPTID__/g, scriptIdName)
        .replace(/__SCRIPTFUNCTIONNAME__/g, scriptFunctionName);
    await fs.writeFile(toFilePath, fileContents);
    await fs.chmod(toFilePath, '755');

    console.log(`${scriptIdName} generated.`);
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
