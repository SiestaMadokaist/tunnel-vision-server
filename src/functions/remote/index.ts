export const app = {
	handler: `dist/functions/app/app.handler`,
	events: [
		{
			http: {
				path: '/{method+}',
				method: 'any',
				cors: {
					origins: ['*'],
					headers: [
						'Authorization',
						'Content-Type',
						'Timeout',
						'Cache-Control',
						'X-Transaction-Id'
					],
					allowCredentials: true
				},
				request: {
					parameters: {
						paths: {
							method: true
						}
					}
				}
			}
		}
	]
};
