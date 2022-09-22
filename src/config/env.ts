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

type BuildEnvs = 'DEPLOY_REGION' | 'DEPLOY_BUCKET' | 'IAM_ROLE' | 'DOMAIN_NAME' | 'SERVICE_NAME';
const buildEnv: fnFromEnv<BuildEnvs> = (k: BuildEnvs) => fromEnv(k);
export const BuildEnv: Record<BuildEnvs, string> = {
	DEPLOY_REGION: buildEnv('DEPLOY_REGION'),
	DEPLOY_BUCKET: buildEnv('DEPLOY_BUCKET'),
	IAM_ROLE: buildEnv('IAM_ROLE'),
	DOMAIN_NAME: buildEnv('DOMAIN_NAME'),
	SERVICE_NAME: buildEnv('SERVICE_NAME')
};

const runtimeEnv: fnFromEnv<RuntimeEnvs> = (k: RuntimeEnvs) => fromEnv(k);
export type RuntimeEnvs = 'NODE_ENV' | 'HOSTNAME' | 'REQUEST_QUEUE' | 'RESPONSE_QUEUE';
export const RuntimeEnv: Record<RuntimeEnvs, string> = {
	NODE_ENV: runtimeEnv('NODE_ENV'),
	REQUEST_QUEUE: runtimeEnv('REQUEST_QUEUE'),
	RESPONSE_QUEUE: runtimeEnv('RESPONSE_QUEUE'),
	HOSTNAME: runtimeEnv('HOSTNAME')
};
