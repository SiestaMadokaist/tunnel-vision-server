import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sls from '@vendia/serverless-express';
import { RemoteHubInstance } from './instances/SQSHubInstance';
const hub = RemoteHubInstance;
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use((req: Request, res: Response, next: NextFunction) => {
	(async () => {
		const response = await hub.getResponse({
			body: req.body,
			headers: req.headers,
			query: req.query as Record<string, string>,
			path: req.path,
			method: req.method as 'GET'
		});
		res.status(response.statusCode).send(response.data);
	})().catch(next);
});

export const handler = sls({ app });

const main = () => {
	app.listen(3001, () => {
		console.log(`listening on 3001`);
	});
};

if (process.argv[1] === __filename) {
	main();
}
