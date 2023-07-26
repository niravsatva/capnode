require('dotenv').config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import router from './app/routes';

// database configuration
import './app/config/db';

const app = express();

app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

// import routes
app.use(router);

// server configuration
app.listen(PORT, () => {
  console.log('Server is listening on port ', PORT);
});
