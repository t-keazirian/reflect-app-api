const express = require('express');
const path = require('path');
const UserService = require('./users-service');

const usersRouter = express.Router();
const jsonParser = express.json();

usersRouter.post('/', jsonParser, (req, res, next) => {
	// info from request body
	const { first_name, last_name, email, password } = req.body;

	// check for missing values in form
	for (const field of ['first_name', 'last_name', 'email', 'password']) {
		if (!req.body[field]) {
			return res.status(400).json({
				error: { message: `Missing ${field} in request body` },
			});
		}
	}

	// validate password
	const passwordError = UserService.validatePassword(password);

	if (passwordError) {
		return res.status(400).json({
			error: { message: passwordError },
		});
	}

	UserService.hasUserWithEmail(req.app.get('db'), email)
		.then(hasUserWithEmail => {
			if (hasUserWithEmail) {
				return res.status(400).json({
					error: { message: 'Email already taken' },
				});
			}

			// if all info is accepted, return hashed password and insert into database
			return UserService.hashPassword(password).then(hashedPassword => {
				const newUser = {
					first_name,
					last_name,
					email,
					password: hashedPassword,
				};

				return UserService.insertUser(req.app.get('db'), newUser).then(user => {
					const subject = user.email;
					const payload = { user_id: user.id };
					res.status(201).json({
						id: user.id,
						first_name,
						last_name,
						email,
						authToken: UserService.createJwt(subject, payload),
					});
					// .status(201)
					// .location(path.posix.join(req.originalUrl, `/${user.id}`))
					// .json(UserService.serializeUser(user));
				});
			});
		})
		.catch(next);
});

module.exports = usersRouter;
