type fnFromEnv<T> = (k: T) => string;
function fromEnv<T>(k: T): string {
  const v = process.env[k as any];
  if (typeof v !== 'string') { throw new Error(`the fuck`); }
  return v;
}

type BuildEnvs = 'DEPLOY_REGION' | 'DEPLOY_BUCKET' | 'IAM_ROLE';
const buildEnv: fnFromEnv<BuildEnvs> = (k: BuildEnvs) => fromEnv(k);
export const BuildEnv: Record<BuildEnvs, string> = {
  DEPLOY_REGION: buildEnv('DEPLOY_REGION'),
  DEPLOY_BUCKET: buildEnv('DEPLOY_BUCKET'),
  IAM_ROLE: buildEnv('IAM_ROLE'),
}

const runtimeEnv: fnFromEnv<RuntimeEnvs> = (k: RuntimeEnvs) => fromEnv(k); 
export type RuntimeEnvs = 'NODE_ENV';
export const RuntimeEnv: Record<RuntimeEnvs, string> = {
  NODE_ENV: runtimeEnv('NODE_ENV'),
}
