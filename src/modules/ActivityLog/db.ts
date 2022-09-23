import { randomUUID } from 'crypto';
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
	expDate?: number;
	_uuid?: string;
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
			},
			{
				rangeKey: 'requestId',
				name: ActivityLogIndex.OWNER_REQUESTID,
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
	_uuid: {
		type: String,
		required: true,
		rangeKey: true,
		default: () => {
			return randomUUID();
		}
	},
	expDate: {
		type: Number,
		required: true,
		default: () => {
			const now = Math.floor(Date.now() / 1000);
			return now + 86400;
		},
		forceDefault: true
	},
	data: {
		type: [Object, dynamoose.type.NULL]
	}
};
const schema = new dynamoose.Schema(activityLogSchemaField, { saveUnknown: true });
const tableName = `${RuntimeEnv.NODE_ENV}-activity_logs`;
export const ActivityLogModel = dynamoose.model(tableName, schema, { throughput: 'ON_DEMAND' });
export const ActivityLogsTable = new dynamoose.Table(tableName, [ActivityLogModel]);
