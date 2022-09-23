import { RuntimeEnv } from '../../../config/RuntimeEnv';
import { RemoteSQSHub } from '../../../modules/Hub/RemoteSQSHub';
import { SQSClient } from '@aws-sdk/client-sqs';

export const RemoteHubInstance = new RemoteSQSHub({
	incoming: {
		channel: RuntimeEnv.RESPONSE_QUEUE
	},
	outgoing: {
		channel: RuntimeEnv.REQUEST_QUEUE,
		client: new SQSClient({})
	}
});
