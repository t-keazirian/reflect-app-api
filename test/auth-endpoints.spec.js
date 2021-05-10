const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const knex = require('knex');
const { makeUsersArray } = require('./users.fixtures');
const { makeAuthHeader } = require('./auth-helper.fixtures');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe.only('Auth Endpoints', () => {
	let db;

	const testUsers = makeUsersArray();

	const testUser = testUsers[0];

	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL,
		});
		app.set('db', db);
	});

	after('disconnect from db', () => db.destroy());
	before('clean table', () =>
		db.raw('TRUNCATE meditations, users RESTART IDENTITY CASCADE')
	);
	afterEach('cleanup', () =>
		db.raw('TRUNCATE meditations, users RESTART IDENTITY CASCADE')
	);

	describe('POST /api/auth/login', () => {
		beforeEach('insert users', () => {
			return db.into('users').insert(testUsers);
		});

		const requiredFields = ['email', 'password'];

		requiredFields.forEach(field => {
			const loginAttemptBody = {
				email: testUser.email,
				password: testUser.password,
			};

			it(`responds with 400 required error when ${field} is missing`, () => {
				delete loginAttemptBody[field];

				return supertest(app)
					.post('/api/auth/login')
					.send(loginAttemptBody)
					.expect(400, {
						error: {
							message: `Missing ${field} in request body`,
						},
					});
			});
		});

		it(`responds with 400 'incorrect email or password when bad password`, () => {
			const userInvalidPass = {
				email: testUser.email,
				password: 'incorrect',
			};
			return supertest(app)
				.post('/api/auth/login')
				.send(userInvalidPass)
				.expect(400, {
					error: {
						message: 'Incorrect email or password',
					},
				});
		});

		it('responds 200 and JWT auth token using secret when valid credentials', () => {
			const userValidCreds = {
				email: testUser.email,
				password: testUser.password,
			};
			const expectedToken = jwt.sign(
				{
					id: testUser.id,
				},
				process.env.JWT_SECRET,
				{
					subject: testUser.email,
					expiresIn: process.env.JWT_EXPIRY,
					algorithm: 'HS256',
				}
			);
			return supertest(app)
				.post('/api/auth/login')
				.send(userValidCreds)
				.expect(200, {
					id: testUser.id,
					authToken: expectedToken,
				});
		});
	});

	describe('POST /api/auth/refresh', () => {
		beforeEach('insert users', () => {
			return db.into('users').insert(testUsers);
		});

		it('responds with 200 and JWT auth token using secret', () => {
			const expectedToken = jwt.sign(
				{
					id: testUser.id,
				},
				process.env.JWT_SECRET,
				{
					subject: testUser.email,
					expiresIn: process.env.JWT_EXPIRY,
					algorithm: 'HS256',
				}
			);
			return supertest(app)
				.post('/api/auth/refresh')
				.set('Authorization', makeAuthHeader(testUser))
				.expect(200, {
					authToken: expectedToken,
				});
		});
	});
});
