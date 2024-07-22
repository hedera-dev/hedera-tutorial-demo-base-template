#!/usr/bin/env node
const process = require('node:process');
const fs = require('node:fs/promises');
const path = require('node:path');
const {
    displayDuration,
} = require('../util/util.js');

async function metricsStats() {
    // read previous stats collected for all scripts
    const loggerFilePath = path.resolve(process.cwd(), '../logger.json');
    const loggerFileJson  = await fs.readFile(loggerFilePath);
    const loggerFile = JSON.parse(loggerFileJson);

    // find first setup script
    // find first task script
    let firstSetupScript;
    let firstTaskScript;
    const completedTasks = [];
    const incompleteTasks = [];
    Object.keys(loggerFile).forEach((scriptId) => {
        const scriptStats = loggerFile[scriptId];
        const {
            scriptCategory,
            firstStart,
            countComplete,
        } = scriptStats;
        scriptStats.scriptId = scriptId;
        switch (scriptCategory) {
            case 'setup':
                if (!firstSetupScript ||
                    (
                        firstStart < firstSetupScript.firstStart &&
                        countComplete > 0
                    )) {
                    firstSetupScript = scriptStats;
                }
                break;
            case 'task':
                if (!firstTaskScript ||
                    (
                        firstStart < firstTaskScript.firstStart &&
                        countComplete > 0
                    )) {
                    firstTaskScript = scriptStats;
                }
                if (countComplete > 0) {
                    completedTasks.push(scriptStats);
                } else {
                    incompleteTasks.push(scriptStats);
                }
                break;
        }
    });

    // Timestamp difference between 1st `start` in setup to 1st `complete` in task
    // --> Quantify **time to hello world**
    const hasCompletedFirstTask = !!(firstSetupScript && firstTaskScript);
    const timeToHelloWorld = hasCompletedFirstTask ?
        firstTaskScript.firstComplete - firstSetupScript.firstStart :
        0;

    // Timestamp difference between 1st `start` in a task to 1st `complete` in the same task
    // --> Quantify time taken to complete specific task
    const totalCountOfTaskCompletions = completedTasks.reduce((count, task) => {
        return count + task.countComplete;
    }, 0);
    const completedTaskDurations = completedTasks.map((task) => {
        const timeToComplete = task.firstComplete - task.firstStart;
        const errorsBeforeFirstComplete = task.countErrorBeforeFirstComplete;
        return {
            name: task.scriptId,
            duration: timeToComplete,
            errors: errorsBeforeFirstComplete,
        };
    });

    // Count of `error` occurrences between 1st instance of a `start`,
    // and 1st instance of a `complete` in the same task
    // --> Quantify number of friction points
    // NOTE this is included in `errorsBeforeFirstComplete` computed above

    // Count of 1st instance of `start` without any corresponding `complete` for the same task
    // --> Quantify the completion rate (and therefore drop-off rate)
    const incompleteAttemptedTaskDurations = incompleteTasks.map((task) => {
        timeToLastAttempt = task.lastError - task.firstStart;
        return {
            name: task.scriptId,
            duration: timeToLastAttempt,
            errors: task.countError,
        };
    });

    console.log('Has completed a task:', hasCompletedFirstTask);
    console.log('First task completed ID:', firstTaskScript.scriptId);
    console.log('Time to first task completion:', timeToHelloWorld);
    console.log('Total number of task completions:', totalCountOfTaskCompletions);
    console.log('Completed tasks:');
    completedTaskDurations.forEach((info, index) => {
        console.log(`(${index + 1}) Task ID:`, info.name);
        console.log('Time taken to complete:', displayDuration(info.duration));
        console.log('Errors prior to completion:', info.errors);
    });
    console.log('Attempted but incomplete tasks:', );
    incompleteAttemptedTaskDurations.forEach((info, index) => {
        console.log(`(${index + 1}) Task ID:`, info.name);
        console.log('Time taken for attempts:', displayDuration(info.duration));
        console.log('Errors thus far:', info.errors);
    });
}

metricsStats();
