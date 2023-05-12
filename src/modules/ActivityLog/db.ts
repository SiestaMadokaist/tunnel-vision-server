import { randomUUID } from 'crypto';
import dynamoose from 'dynamoose';
import { SchemaDefinition, ValueType } from 'dynamoose/dist/Schema';
import { RuntimeEnv } from '../../config/RuntimeEnv';
import { TIME } from '../../helper/TIME';
import { minimatch } from 'minimatch';
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
	isExpired(now: number): Promise<boolean>;
	inactiveDuration(now: number): Promise<number>;
	shouldAccept(path: string): Promise<boolean>;
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
		type: Array,
		default: () => {
			return ["**/**"]
		},
		get(value?: ValueType) {
			if (!(value instanceof Array)) {
				return ["**/**"];
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


const isExpired: IActivityLogVirtual['isExpired'] = async function (this: IActivityLogVirtual, now) {
	// return this.inactiveDuration(now) > (1 * TIME.MINUTE);
	const inactiveDuration = await this.inactiveDuration(now);
	return inactiveDuration > (5 * TIME.MINUTE);
}

const inactiveDuration: IActivityLogVirtual['inactiveDuration'] = async function (this: IActivityLog, now) {
	return now - this.createdAt;
}

const shouldAccept: IActivityLogVirtual['shouldAccept'] = async function (this: IActivityLog, path) {
	const { whitelist } = this;
	for (const pattern of whitelist) {
		const match = minimatch(path, pattern);
		if (match) { return true; }
	}
	return false
}

const prototype = ActivityLogModel.methods.item;
prototype.set('isExpired', isExpired);
prototype.set('inactiveDuration', inactiveDuration);
prototype.set('shouldAccept', shouldAccept);

export const ActivityLogsTable = new dynamoose.Table(tableName, [ActivityLogModel]);
