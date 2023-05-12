import { ActivityLog } from '../modules/ActivityLog';
import { IActivityLog } from '../modules/ActivityLog/db';


const activityLog = new ActivityLog();
export interface IRecordConnect {
	whitelist?: string[];
}
export class RecordConnect {
	constructor(private props: IRecordConnect) { }

	async execute(): Promise<IActivityLog> {
		const { whitelist } = this.props
		return activityLog.recordConnect({ whitelist });
	}
}
