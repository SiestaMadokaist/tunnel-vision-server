import { ActivityLog } from '../modules/ActivityLog';
import { IActivityLog } from '../modules/ActivityLog/db';

const activityLog = new ActivityLog();
export class RecordConnect {
	constructor() {}

	async execute(): Promise<IActivityLog> {
		return activityLog.recordConnect();
	}
}
