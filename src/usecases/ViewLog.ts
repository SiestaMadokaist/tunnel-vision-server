import { ActivityLog, IRequestResponse } from '../modules/ActivityLog';

const activityLog = new ActivityLog();
export class ViewLog {
	constructor() {}

	async execute(): Promise<IRequestResponse[]> {
		const data = await activityLog.requestResponses();
		return data;
	}
}
