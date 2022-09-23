const cors = {
	origins: ['*'],
	headers: ['Authorization', 'Content-Type', 'Timeout', 'Cache-Control', 'X-Transaction-Id'],
	allowCredentials: true
};
export const app = {
	handler: `dist/functions/remote/app.handler`,
	events: [
		{
			http: {
				path: '/',
				method: 'any',
				cors
			}
		},
		{
			http: {
				path: '{method+}',
				method: 'any',
				cors,
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
