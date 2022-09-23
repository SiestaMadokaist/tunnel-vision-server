import { fnFromEnv, fromEnv } from './base';
const runtimeEnv: fnFromEnv<RuntimeEnvs> = (k: RuntimeEnvs) => fromEnv(k);
export type RuntimeEnvs = 'NODE_ENV' | 'REQUEST_QUEUE' | 'RESPONSE_QUEUE' | 'OWNER';
export const RuntimeEnv: Record<RuntimeEnvs, string> = {
	NODE_ENV: runtimeEnv('NODE_ENV'),
	REQUEST_QUEUE: runtimeEnv('REQUEST_QUEUE'),
	RESPONSE_QUEUE: runtimeEnv('RESPONSE_QUEUE'),
	OWNER: runtimeEnv('OWNER')
};
