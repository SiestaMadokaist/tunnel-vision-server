import dynamoose from 'dynamoose';
import { SchemaDefinition } from 'dynamoose/dist/Schema';
import { RuntimeEnv } from '../../config/RuntimeEnv';
export enum ActivityLogIndex {
	OWNER_CREATEDAT = 'owner-createdAt',
	OWNER_REQUESTID = 'owner-requestId'
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
				rangeKey: 'requestId',
				name: ActivityLogIndex.OWNER_REQUESTID,
				throughput: 'ON_DEMAND',
				type: 'local'
			},
			{
				rangeKey: 'createdAt',
				name: ActivityLogIndex.OWNER_CREATEDAT,
				throughput: 'ON_DEMAND',
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
		required: true
	},
	data: {
		type: Object
	}
};
const schema = new dynamoose.Schema(activityLogSchemaField, { saveUnknown: true });

const tableName = `${RuntimeEnv.NODE_ENV}-activity_logs`;
export const ActivityLogModel = dynamoose.model(tableName, schema);
export const ActivityLogsTable = new dynamoose.Table(tableName, [ActivityLogModel], {
	create: false
});
