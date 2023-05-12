import { randomUUID } from 'crypto';
import dynamoose from 'dynamoose';
import { SchemaDefinition, ValueType } from 'dynamoose/dist/Schema';
import { RuntimeEnv } from '../../config/RuntimeEnv';
import { TIME } from '../../helper/TIME';
export enum ActivityLogIndex {
	OWNER_CREATEDAT = 'owner-createdAt',
	OWNER_REQUESTID = 'owner-requestId'
}


export type RequestID = `${number}-${number}`;
export const ConnectRequestID = "connect" as RequestID

export interface IActivityLog {
	owner: 'ramadoka' | 'permagate' | 'darkash';
	createdAt: number;
	activityType: 'connect' | 'request' | 'response';
	requestId: RequestID;
	whitelist: string[];
	data: unknown;
	expDate?: number;
	_uuid?: string;
}

export interface IActivityLogVirtual {
	isExpired(now: number): boolean;
	inactiveDuration(now: number): number;
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
	whitelist: {
		type: [String],
		default: () => {
			return ["*"]
		},
		get(value?: ValueType) {
			if (!(value instanceof Array)) {
				return ["*"];
			}
			return value;
		},
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


const isExpired: IActivityLogVirtual['isExpired'] = function (this: IActivityLogVirtual, now) {
	return this.inactiveDuration(now) > (1 * TIME.MINUTE);
}

const inactiveDuration: IActivityLogVirtual['inactiveDuration'] = function (this: IActivityLog, now) {
	return now - this.createdAt;
}

ActivityLogModel.methods.set('isExpired', isExpired);
ActivityLogModel.methods.set('inactiveDuration', inactiveDuration);

export const ActivityLogsTable = new dynamoose.Table(tableName, [ActivityLogModel]);
