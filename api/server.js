import app from './app.js';
import config from './config/env.js';

app.listen(config.port, () => {
	console.log(`application is listening on ${config.port}`);
});

