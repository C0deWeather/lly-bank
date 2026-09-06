import express from 'express';
import routes from './routes/index.js';
import errorHandler from './middleware/error.handler.js';

const app = express();

app.use(express.json());
app.use(routes);
app.use(errorHandler);

export default app;

