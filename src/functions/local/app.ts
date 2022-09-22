import { RuntimeEnv } from '../../config/env';
import * as sqs from '@aws-sdk/client-sqs';
import { ClientSQSHub } from '../../modules/Hub/ClientSQSHub';

const hub = new ClientSQSHub({
	incoming: {
		channel: RuntimeEnv.REQUEST_QUEUE,
		hostname: RuntimeEnv.HOSTNAME
	},
	outgoing: {
		channel: RuntimeEnv.RESPONSE_QUEUE,
		client: new sqs.SQSClient({})
	}
});

async function main(): Promise<void> {
	hub.start();
}

if (process.argv[1] === __filename) {
	main();
}
