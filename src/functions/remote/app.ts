import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sls from '@vendia/serverless-express';
import { ViewLog } from '../../usecases/ViewLog';
import { RecordConnect } from '../../usecases/Connect';
import { ProxyForward } from '../../usecases/ProxyForward';

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.get('/~internals/histories', (_req, res, next) => {
	(async () => {
		const useCase = new ViewLog();
		const response = await useCase.execute();
		res.json({ data: response });
	})().catch(next);
});

app.put('/~internals/connect', (_req, res, next) => {
	(async () => {
		const useCase = new RecordConnect();
		const response = await useCase.execute();
		res.json({ data: response });
	})().catch(next);
});

app.use((req: Request, res: Response, next: NextFunction) => {
	(async () => {
		const useCase = new ProxyForward({
			body: req.body,
			headers: req.headers,
			query: req.query as Record<string, string>,
			url: req.path,
			method: req.method as 'GET'
		});
		const response = await useCase.execute();
		res.status(response.statusCode).send(response.body);
	})().catch(next);
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
	if (error instanceof Error) {
		res.json({ message: error.message, name: error.name });
	} else {
		res.json({ message: 'something went wrong', name: 'UnknownError' });
	}
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
