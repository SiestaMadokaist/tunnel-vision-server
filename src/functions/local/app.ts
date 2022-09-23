#!/usr/bin/env node
import * as sqs from '@aws-sdk/client-sqs';
import { ClientSQSHub } from '../../modules/Hub/ClientSQSHub';
import { LocalEnv } from './env';

const hub = new ClientSQSHub({
	incoming: {
		channel: LocalEnv.REQUEST_QUEUE,
		hostname: LocalEnv.TARGET_HOST
	},
	outgoing: {
		channel: LocalEnv.RESPONSE_QUEUE,
		client: new sqs.SQSClient({})
	}
});

async function main(): Promise<void> {
	hub.start();
}

if (process.argv[1] === __filename) {
	main();
}

if (process.argv[1].endsWith('node_modules/.bin/tunnel-vision')) {
	main();
}
