#!/usr/bin/env node

import {
    Client,
    PrivateKey,
    AccountId,
} from '@hashgraph/sdk';
import dotenv from 'dotenv';
import {
    blueLog,
    metricsTrackOnHcs,
} from '../util/util.js';

const scriptId = 'HTDBT-script1Error';
let client;
let marker = 'initial';

async function script1Error() {
    metricsTrackOnHcs(scriptId, 'run');

    blueLog('Welcome to the 5 minute HTS token launch challenge!');

    // Read in environment variables from `.env` file in parent directory
    dotenv.config({ path: '../.env' });
    marker = 'read-dotenv';

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
    console.log('Using your name as:', yourName);
    console.log('Using account:', operatorIdStr);
    console.log('');
    marker = 'operator';

    blueLog('Running the main part of the script');
    if (!!true) {
        throw new Error('Test error, this was inevitable!');
    }

    client.close();

    metricsTrackOnHcs(scriptId, 'complete');
}

script1Error().catch((ex) => {
    if (client) {
        client.close();
    }
    console.error(ex);
    metricsTrackOnHcs(scriptId, `error-after-marker-${marker}`);
});
