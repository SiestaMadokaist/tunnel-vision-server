import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import sls from '@vendia/serverless-express';

const app = express();
app.use(bodyParser.json());
app.use(cors());
// app.use((req, _res, next) => {
// 	const { body, query, url, params } = req;
// 	console.log({ body, query, url, params });
// 	next();
// });
app.get('/', (_req, res) => {
	res.json({ ok: 200 });
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
