import { ModelType } from 'dynamoose/dist/General';
import { Item } from 'dynamoose/dist/Item';
import { RuntimeEnv } from '../../config/RuntimeEnv';
import { IRequest, IResponse } from '../Hub/interface';
import { ActivityLogIndex, ActivityLogModel, IActivityLog, RequestID } from './db';
interface IActivityRecord extends IActivityLog, Item {}
const owner = RuntimeEnv.OWNER as IActivityLog['owner'];

export interface IRequestResponse {
	request: IActivityLog;
	response: IActivityLog;
}

export class ActivityLog {
	private model(): ModelType<IActivityRecord> {
		return ActivityLogModel as ModelType<IActivityRecord>;
	}

	async inactiveDuration(at: number = Date.now()): Promise<number> {
		const lastActive = await this.lastActive();
		return at - lastActive;
	}

	async lastActive(): Promise<number> {
		const query = await this.model()
			.query({ owner })
			.using(ActivityLogIndex.OWNER_CREATEDAT)
			.sort('descending')
			.limit(1);
		const items = await query.exec();
		if (items.length === 0) {
			return 0;
		}
		return items[0].createdAt;
	}

	async requestResponses(): Promise<IRequestResponse[]> {
		const query = this.model()
			.query({ owner })
			.using(ActivityLogIndex.OWNER_CREATEDAT)
			.limit(100)
			.filter('activityType')
			.not()
			.eq('connect');
		const data = await query.exec();
		const accumulator: Record<RequestID, IRequestResponse> = {};
		for (const datum of data) {
			if (datum.activityType === 'connect') {
				continue;
			}
			const prev = accumulator[datum.requestId] ?? {};
			prev[datum.activityType] = datum;
			accumulator[datum.requestId] = prev;
		}
		const result: IRequestResponse[] = [];
		for (const key of Object.keys(accumulator)) {
			const value = accumulator[key as IActivityLog['requestId']];
			result.push(value);
		}
		return result;
	}

	private async saveRecord(
		params: Partial<IActivityLog>,
		overwrite: boolean = false
	): Promise<IActivityRecord> {
		console.log({ saving: params });
		return await this.model().create(
			{
				activityType: params.activityType,
				data: params.data,
				owner: params.owner,
				requestId: params.requestId,
				createdAt: params.createdAt
			},
			{ overwrite }
		);
	}

	async recordRequest(requestId: IActivityLog['requestId'], request: IRequest): Promise<void> {
		await this.saveRecord({
			activityType: 'request',
			data: request,
			owner,
			requestId
		});
	}

	async recordResponse(response: IResponse): Promise<void> {
		await this.saveRecord({
			activityType: 'response',
			data: response,
			owner,
			requestId: response.requestId
		});
	}

	async recordConnect(): Promise<IActivityRecord> {
		return this.saveRecord(
			{
				activityType: 'connect',
				data: null,
				owner,
				requestId: `connect` as RequestID,
				createdAt: Date.now(),
				_uuid: '0000-0000'
			},
			true
		);
	}
}
