const bcrypt = require('bcryptjs');
const xss = require('xss');
const jwt = require('jsonwebtoken');
const config = require('../config');

// should I add one for get meditations by user??

const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UserService = {
	hasUserWithEmail(knex, email) {
		return knex
			.from('users')
			.where({ email })
			.first()
			.then(user => !!user);
	},

	// do I need get users and get by id?
	getAllUsers(knex) {
		return knex.select('*').from('users');
	},

	getUserById(knex, id) {
		return knex.from('users').select('*').where('id', id).first();
	},

	insertUser(knex, newUser) {
		return knex
			.insert(newUser)
			.into('users')
			.returning('*')
			.then(([user]) => user);
	},

	validatePassword(password) {
		if (password.length < 8) {
			return 'Password must be longer than 8 characters';
		}
		if (password.length > 72) {
			return 'Password must be less than 72 characters';
		}
		if (password.startsWith(' ') || password.endsWith(' ')) {
			return 'Password must not start or end with empty spaces';
		}
		if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
			return 'Password must contain at least: one upper case, one lower case, one number, and one special character';
		}
		return null;
	},

	hashPassword(password) {
		return bcrypt.hash(password, 12);
	},

	serializeUser(user) {
		return {
			id: user.id,
			first_name: xss(user.first_name),
			last_name: xss(user.last_name),
			email: xss(user.email),
		};
	},

	createJwt(subject, payload) {
	  return jwt.sign(payload, config.JWT_SECRET, {
	    subject,
	    expiresIn: config.JWT_EXPIRY,
	    algorithm: "HS256",
	  });
	},
};

module.exports = UserService;
