import { fnFromEnv, fromEnv } from './base';

type BuildEnvs =
	| 'DEPLOY_REGION'
	| 'DEPLOY_BUCKET'
	| 'IAM_ROLE'
	| 'DOMAIN_NAME'
	| 'SERVICE_NAME'
	| 'NAMESPACE';
const buildEnv: fnFromEnv<BuildEnvs> = (k: BuildEnvs) => fromEnv(k);
export const BuildEnv: Record<BuildEnvs, string> = {
	DEPLOY_REGION: buildEnv('DEPLOY_REGION'),
	DEPLOY_BUCKET: buildEnv('DEPLOY_BUCKET'),
	IAM_ROLE: buildEnv('IAM_ROLE'),
	DOMAIN_NAME: buildEnv('DOMAIN_NAME'),
	SERVICE_NAME: buildEnv('SERVICE_NAME'),
	NAMESPACE: buildEnv('NAMESPACE')
};
