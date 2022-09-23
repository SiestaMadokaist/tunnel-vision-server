import dynamoose from 'dynamoose';
import { RuntimeEnv } from '../config/RuntimeEnv';
const schema = new dynamoose.Schema(
	{
		headers: Object,
		body: Object,
		query: Object,
		params: Object,
		url: String,
		room: {
			type: String,
			hashKey: true
		},
		createdAt: {
			type: Number,
			rangeKey: true,
			default: () => Date.now()
		}
	},
	{ saveUnknown: true }
);

export const LogCallModel = dynamoose.model(`${RuntimeEnv.NODE_ENV}-log_calls`, schema);
export const LogCallTable = new dynamoose.Table(
	`${RuntimeEnv.NODE_ENV}-log_calls`,
	[LogCallModel],
	{ create: false }
);
