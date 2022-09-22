import type { AWS } from '@serverless/typescript';
import { BuildEnv, RuntimeEnv } from './src/config/env';
import { handler } from './src/app';

const serverlessConfiguration: AWS = {
	service: 'tunnel-vision',
	frameworkVersion: '3',
	plugins: [],
	provider: {
		region: BuildEnv.DEPLOY_REGION as AWS['provider']['region'],
		name: 'aws',
		runtime: 'nodejs16.x',
		versionFunctions: false,
		stage: RuntimeEnv.NODE_ENV,
		deploymentBucket: {
			name: BuildEnv.DEPLOY_REGION
		},
		apiGateway: {
			minimumCompressionSize: 1024,
			shouldStartNameWithService: true
		},
		// iam: {
		// 	role: BuildEnv.IAM_ROLE
		// },
		environment: {
			VERSION: '1',
			AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
			NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
		}
	},
	// import the function via paths
	functions: { handler: handler as any },
	package: {
		exclude: ['node_modules/aws-sdk', 'node_modules/typescript'],
		individually: true
	},
	custom: {
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

module.exports = serverlessConfiguration;
