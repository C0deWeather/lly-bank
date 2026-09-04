import app from './app.js';
import config from './config/env.js';
import connectDb from './config/db.js';

await connectDb();

app.listen(config.port, () => {
	console.log(`application is listening on ${config.port}`);
});

