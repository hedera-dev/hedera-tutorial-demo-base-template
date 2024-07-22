#!/usr/bin/env node

import {
    Client,
    PrivateKey,
    AccountId,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';
import {
    createLogger,
} from '../util/util.js';

const logger = await createLogger({
    scriptId: 'script1Error',
    scriptCategory: 'task',
});
let client;

async function script1Error() {
    logger.logStart('Welcome to a test script for the Hedera tutorial demo base template!');

    // Read in environment variables from `.env` file in parent directory
    dotenv.config({ path: '../.env' });
    logger.log('Read .env file');

    // Initialise the operator account
    const yourName = process.env.YOUR_NAME;
    const operatorIdStr = process.env.OPERATOR_ACCOUNT_ID;
    const operatorKeyStr = process.env.OPERATOR_ACCOUNT_PRIVATE_KEY;
    if (!yourName || !operatorIdStr || !operatorKeyStr) {
        throw new Error('Must set OPERATOR_ACCOUNT_ID and OPERATOR_ACCOUNT_PRIVATE_KEY environment variables');
    }
    const operatorId = AccountId.fromString(operatorIdStr);
    const operatorKey = PrivateKey.fromStringECDSA(operatorKeyStr);
    client = Client.forTestnet().setOperator(operatorId, operatorKey);
    logger.log('Using your name as:', yourName);
    logger.log('Using account:', operatorIdStr);

    await logger.logSectionWithWaitPrompt('Running the main part of the script');
    await (new Promise((resolve) => { setTimeout(resolve, 1_000) }));
    if (!!true) {
        throw new Error('Test error, this was inevitable!');
    }

    client.close();
    logger.logComplete('Test script complete!');
}

script1Error().catch((ex) => {
    client && client.close();
    logger ? logger.logError(ex) : console.error(ex);
});
