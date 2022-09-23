import dynamoose from 'dynamoose';
import { SchemaDefinition } from 'dynamoose/dist/Schema';
import { RuntimeEnv } from '../../config/RuntimeEnv';
export enum ActivityLogIndex {
	OWNER_CREATEDAT = 'owner-createdAt'
}

export type RequestID = `${number}-${number}`;

export interface IActivityLog {
	owner: 'ramadoka' | 'permagate' | 'darkash';
	createdAt: number;
	activityType: 'connect' | 'request' | 'response';
	requestId: RequestID;
	data: unknown;
}

const activityLogSchemaField: Record<keyof IActivityLog, SchemaDefinition['']> = {
	owner: {
		type: String,
		required: true,
		enum: ['ramadoka', 'permagate', 'darkash'],
		hashKey: true,
		index: [
			{
				rangeKey: 'createdAt',
				name: ActivityLogIndex.OWNER_CREATEDAT,
				type: 'global'
			}
		]
	},
	createdAt: {
		type: Number,
		default: () => Date.now(),
		required: true
	},
	activityType: {
		type: String,
		required: true,
		enum: ['connect', 'request', 'response']
	},
	requestId: {
		type: String,
		required: true,
		rangeKey: true
	},
	data: {
		type: [Object, dynamoose.type.NULL]
	}
};
const schema = new dynamoose.Schema(activityLogSchemaField, { saveUnknown: true });
const tableName = `${RuntimeEnv.NODE_ENV}-activity_logs`;
export const ActivityLogModel = dynamoose.model(tableName, schema, { throughput: 'ON_DEMAND' });
export const ActivityLogsTable = new dynamoose.Table(tableName, [ActivityLogModel], {
	create: false
});
