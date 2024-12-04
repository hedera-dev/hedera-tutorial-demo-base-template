#!/usr/bin/env node

const process = require('node:process');
const path = require('node:path');
const fs = require('node:fs/promises');

const { getBaseTemplateVersionStamp } = require('../util/util.js');

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
    case 'version-stamp':
      await versionStamp();
      break;
    case 'init-repo':
      await initRepo();
      // await update();
      // await scaffoldTask();
      break;
    default:
      console.error('Unrecognised sub-command:', subCmd);
      break;
  }
}

async function update() {
  console.log('Updating from upstream base template...');
  const rootDirFiles = [
    '.env.sample',
    '.rpcrelay.env.sample',
    'logger.json.sample',
    '.gitpod.yml',
    '.gitignore.sample',
    '.prettierrc.js',
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
  console.log(rootDirFiles.map((text) => `- ${text}`).join('\n'));

  // mkdir if doesn't exist
  await fs.mkdir(path.resolve(processCwd, 'util'), { recursive: true });
  await copyFilesFromTemplateToCwd('util', utilDirFiles);
  console.log('Copied the following files into the "util" directory:');
  console.log(utilDirFiles.map((text) => `- ${text}`).join('\n'));

  const { toDir } = resolveFromAndToDirs('.');
  await fs.copyFile(
    path.resolve(toDir, '.gitignore.sample'),
    path.resolve(toDir, '.gitignore'),
  );

  // suggest a git commit command
  const version = await getBaseTemplateVersionStamp('main');
  const suggestedGitCommitMessage = `feat: update from upstream base template - ${version}`;
  const suggestedGitCommitCommand = `git commit -s -m "${suggestedGitCommitMessage}"`;
  console.log('Suggested git commit command:\n', suggestedGitCommitCommand);
}

async function scaffoldTask() {
  console.log('Generating new task from upstream base template...');
  const taskId = process.argv[3] || 'unnamedTask';

  // remove separators, then camelCase
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
  const scriptFunctionName =
    'script' + scriptIdName[0].toUpperCase() + scriptIdName.slice(1);
  console.log({ taskId, scriptIdName, scriptFunctionName });

  // mkdir if dir name of scriptId does not yet exist
  await fs.mkdir(path.resolve(processCwd, scriptIdName), { recursive: true });

  // verbatim copy of file
  let fromFilePath = path.resolve(__dirname, '..', 'demo-task', 'package.json');
  let toFilePath = path.resolve(processCwd, scriptIdName, 'package.json');
  await fs.copyFile(fromFilePath, toFilePath);

  // make copy of file with replacements, and overwrite in place
  fromFilePath = path.resolve(__dirname, '..', 'demo-task', 'script-demo.js');
  toFilePath = path.resolve(
    processCwd,
    scriptIdName,
    `script-${scriptIdName}.js`,
  );
  const fileContentsBuffer = await fs.readFile(fromFilePath);
  let fileContents = fileContentsBuffer.toString('utf8');
  fileContents = fileContents
    .replace(/__SCRIPTID__/g, scriptIdName)
    .replace(/__SCRIPTFUNCTIONNAME__/g, scriptFunctionName);
  await fs.writeFile(toFilePath, fileContents);

  // make the script file executable
  await fs.chmod(toFilePath, '755');

  console.log(`${scriptIdName} generated.`);
}

async function versionStamp() {
  const version = await getBaseTemplateVersionStamp();
  console.log(version);
}

async function initRepo() {
  console.log(
    'Initialising new repo using hedera-tutorial-demo-base-template...',
  );

  // mkdir if doesn't exist
  await fs.mkdir(path.resolve(processCwd, 'util'), { recursive: true });
  await fs.mkdir(path.resolve(processCwd, 'img'), { recursive: true });

  const { fromDir, toDir } = resolveFromAndToDirs('.');
  const fileList = [
    {
      fromFile: 'README.template.md',
      toFile: 'README.md',
    },
    {
      fromFile: 'package.template.json',
      toFile: 'package.json',
    },
    {
      fromFile: 'img/gitpod-open-button.svg',
      toFile: 'img/gitpod-open-button.svg',
    },
  ];
  const fileCopyPromises = fileList.map(({ fromFile, toFile }) => {
    const filePathFrom = path.resolve(fromDir, fromFile);
    const filePathTo = path.resolve(toDir, toFile);
    // return console.log('fs.copyFile', filePathFrom, filePathTo);
    return fs.copyFile(filePathFrom, filePathTo);
  });
  await Promise.all(fileCopyPromises);

  console.log(
    'Be sure you edit/ replace all instances of "TODO_*" in the following files:',
  );
  fileList.forEach(({ toFile }) => {
    console.log(`- ${toFile}`);
  });

  // suggest a git commit command
  const version = await getBaseTemplateVersionStamp('main');
  const suggestedGitCommitMessage = `feat: initialise new repo from upstream base template - ${version}`;
  const suggestedGitCommitCommand = `git commit -s -m "${suggestedGitCommitMessage}"`;
  console.log('Suggested git commit command:\n', suggestedGitCommitCommand);
}

function resolveFromAndToDirs(subdir) {
  return {
    fromDir: path.resolve(__dirname, '..', subdir),
    toDir: path.resolve(processCwd, subdir),
  };
}

async function copyFilesFromTemplateToCwd(subdir, fileNamesFrom, fileNamesTo) {
  const { fromDir, toDir } = resolveFromAndToDirs(subdir);
  const fileCopyPromises = fileNamesFrom.map((fileNameFrom, idx) => {
    const fileNameTo = fileNamesTo?.[idx] || fileNameFrom;
    const fromFilePath = path.resolve(fromDir, fileNameFrom);
    const toFilePath = path.resolve(toDir, fileNameTo);
    return fs.copyFile(fromFilePath, toFilePath);
  });
  await Promise.all(fileCopyPromises);
}

hederaTutorialDemoBaseTemplateRun();
