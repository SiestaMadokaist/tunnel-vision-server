import type { AWS } from '@serverless/typescript';
import { BuildEnv, RuntimeEnv } from './src/config/env';
import { app } from './src/functions/remote';

const serverlessConfiguration: AWS = {
	service: BuildEnv.SERVICE_NAME,
	frameworkVersion: '3',
	plugins: [],
	provider: {
		region: BuildEnv.DEPLOY_REGION as AWS['provider']['region'],
		name: 'aws',
		runtime: 'nodejs16.x',
		versionFunctions: false,
		stage: RuntimeEnv.NODE_ENV,
		deploymentBucket: {
			name: BuildEnv.DEPLOY_BUCKET
		},
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true
		},
		iam: {
			role: BuildEnv.IAM_ROLE
		},
		environment: {
			VERSION: '1',
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000'
		}
	},
	functions: { app },
	package: {
		exclude: ['node_modules/aws-sdk/**', 'node_modules/typescript'],
		individually: true
	},
	custom: {
		customDomain: {
			domainName: BuildEnv.DOMAIN_NAME,
			stage: RuntimeEnv.NODE_ENV,
			createRoute53Record: false
		},
		esbuild: {
			bundle: false,
			minify: false,
			sourcemap: true,
			exclude: ['aws-sdk'],
			target: 'node16',
			define: { 'require.resolve': undefined },
			platform: 'node',
			concurrency: 10
		}
	}
};
// console.dir({ serverlessConfiguration }, { depth: 15 });
module.exports = serverlessConfiguration;
