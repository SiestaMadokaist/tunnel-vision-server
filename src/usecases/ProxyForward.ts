import { RuntimeEnv } from '../config/RuntimeEnv';
import { Memoizer } from '../helper/Memoizer';
import { TIME } from '../helper/TIME';
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
		const lastSession = await activityLog.lastSession()
		const now = Date.now();
		const isExpired = await lastSession.isExpired(now);
		if (isExpired) {
			const inactiveDuration = await lastSession.inactiveDuration(now)
			const inactiveMinute = (inactiveDuration / TIME.MINUTE).toFixed(3)
			const lastActive = lastSession.createdAt
			throw new Error(`(${RuntimeEnv.OWNER}) last connection was ${new Date(lastActive)} (${inactiveMinute} minute ago)`);
		}
		await activityLog.recordRequest(this.requestId(), this.req);
		const response = await remoteHub.getResponse(this.requestId(), this.req);
		await activityLog.recordResponse(response);
		return response;
	}
}

async function main(): Promise<void> {
	await activityLog.recordConnect({});
	console.log('done');
}

if (process.argv[1] === __filename) {
	main();
}
