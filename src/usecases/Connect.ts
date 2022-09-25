import { ActivityLog } from '../modules/ActivityLog';

const activityLog = new ActivityLog();
export class RecordConnect {
	constructor() {}

	async execute(): Promise<{ ok: 200 }> {
		await activityLog.recordConnect();
    return { ok: 200 };
	}
}
