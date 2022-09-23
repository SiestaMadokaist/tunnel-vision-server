import dotenv from 'dotenv';
dotenv.config();

type fnFromEnv<T> = (k: T) => string;
function fromEnv<T>(k: T): string {
	const v = process.env[k as any];
	if (typeof v !== 'string') {
		throw new Error(`the fuck, ${k} is not set`);
	}
	return v;
}
const localEnv: fnFromEnv<LocalEnvs> = (k: LocalEnvs) => fromEnv(k);
type LocalEnvs = 'REQUEST_QUEUE' | 'TARGET_HOST' | 'RESPONSE_QUEUE';

export const LocalEnv: Record<LocalEnvs, string> = {
	REQUEST_QUEUE: localEnv('REQUEST_QUEUE'),
	TARGET_HOST: localEnv('TARGET_HOST'),
	RESPONSE_QUEUE: localEnv('RESPONSE_QUEUE')
};
