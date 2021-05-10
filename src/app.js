require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV, CLIENT_ORIGIN } = require('./config');
const reflectionsRouter = require('./reflections/reflections-router');
const usersRouter = require('./users/users-router');
const authRouter = require('./auth/auth-router');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'dev';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(
	cors({
		origin: CLIENT_ORIGIN,
	})
);

app.use('/api/reflections', reflectionsRouter);
app.use('/api/users', usersRouter);
app.use('/api/auth', authRouter);

app.get('/api/', (req, res) => {
	res.send('Hello, world!');
});

app.use(function ErrorHandler(error, req, res, next) {
	let response;
	if (NODE_ENV === 'production') {
		response = { error: { message: 'server error' } };
	} else {
		console.log(error);
		response = { message: error.message, error };
	}
	res.status(500).json(response);
});

module.exports = app;
