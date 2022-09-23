import { Memoizer } from '../helper/Memoizer';
import { RemoteHubInstance as remoteHub } from '../instances/SQSHubInstance';
import { ActivityLog } from '../modules/ActivityLog';
import { RequestID } from '../modules/ActivityLog/db';
import { IRequest, IResponse } from '../modules/Hub/interface';

const activityLog = new ActivityLog();
export class ProxyForward {
	#memo = new Memoizer<{ requestId: RequestID }>();
	constructor(private req: IRequest) {}

	requestId(): RequestID {
		return this.#memo.memoize('requestId', () => {
			const rng = Math.floor(Math.random() * Math.pow(10, 7));
			return `${Date.now()}-${rng}`;
		});
	}

	async execute(): Promise<IResponse> {
		await activityLog.recordRequest(this.requestId(), this.req);
		const response = await remoteHub.getResponse(this.requestId(), this.req);
		await activityLog.recordResponse(response);
		return response;
	}
}
