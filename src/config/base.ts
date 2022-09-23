import dotenv from 'dotenv';
dotenv.config({ path: process.env.CONFIG_PATH });
export type fnFromEnv<T> = (k: T) => string;
export function fromEnv<T>(k: T): string {
	const v = process.env[k as any];
	if (typeof v !== 'string') {
		throw new Error(`the fuck, ${k} is not set`);
	}
	return v;
}
