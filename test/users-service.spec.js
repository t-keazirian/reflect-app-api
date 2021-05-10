const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const knex = require('knex');
const { makeUsersArray } = require('./users.fixtures');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

describe.only('Users Endpoint', () => {
	let db;
	before('make knex instance', () => {
		db = knex({
			client: 'pg',
			connection: process.env.TEST_DATABASE_URL,
		});
		app.set('db', db);
	});

	after('disconnect from db', () => db.destroy());
	// before('clean table', () => db('users').truncate());
	before('clean table', () =>
		db.raw('TRUNCATE meditations, users RESTART IDENTITY CASCADE')
	);
	afterEach('cleanup', () =>
		db.raw('TRUNCATE meditations, users RESTART IDENTITY CASCADE')
	);

	describe('POST /api/reflections/users', () => {
		context('User validation,', () => {
			const testUsers = makeUsersArray();
			beforeEach('insert users', () => {
				return db.into('users').insert(testUsers);
			});

			const requiredFields = ['first_name', 'last_name', 'email', 'password'];

			requiredFields.forEach(field => {
				const signupAttemptBody = {
					first_name: 'test first name',
					last_name: 'test last name',
					email: 'test@email.com',
					password: 'test password',
				};

				it(`responds with 400 required error when ${field} is missing`, () => {
					delete signupAttemptBody[field];

					return supertest(app)
						.post('/api/reflections/users')
						.send(signupAttemptBody)
						.expect(400, {
							error: { message: `Missing ${field} in request body` },
						});
				});
			});

			it(`responds with 400 when password is less than 8 characters`, () => {
				const userShortPassword = {
					first_name: 'test first name',
					last_name: 'test last name',
					email: 'test@email.com',
					password: 'short',
				};

				return supertest(app)
					.post('/api/reflections/users')
					.send(userShortPassword)
					.expect(400, {
						error: { message: 'Password must be longer than 8 characters' },
					});
			});

			it('responds with 400 when password is longer than 72 characters', () => {
				const userLongPassword = {
					first_name: 'test first name',
					last_name: 'test last name',
					email: 'test@email.com',
					password: '*'.repeat(73),
				};

				return supertest(app)
					.post('/api/reflections/users')
					.send(userLongPassword)
					.expect(400, {
						error: { message: 'Password must be less than 72 characters' },
					});
			});

			it('responds with 400 when password starts with spaces', () => {
				const userPasswordWithSpaces = {
					first_name: 'test first name',
					last_name: 'test last name',
					email: 'test@email.com',
					password: ' 123456789',
				};

				return supertest(app)
					.post('/api/reflections/users')
					.send(userPasswordWithSpaces)
					.expect(400, {
						error: { message: 'Password must not start or end with spaces' },
					});
			});

			it('responds with 400 when password ends with spaces', () => {
				const userPasswordWithSpaces = {
					first_name: 'test first name',
					last_name: 'test last name',
					email: 'test@email.com',
					password: '123456789 ',
				};

				return supertest(app)
					.post('/api/reflections/users')
					.send(userPasswordWithSpaces)
					.expect(400, {
						error: { message: 'Password must not start or end with spaces' },
					});
			});

			it('responds with 400 when password does not contain complex characters', () => {
				const userPasswordNotComplex = {
					first_name: 'test first name',
					last_name: 'test last name',
					email: 'test@email.com',
					password: '11AAaabbcc',
				};

				return supertest(app)
					.post('/api/reflections/users')
					.send(userPasswordNotComplex)
					.expect(400, {
						error: {
							message:
								'Password must contain at least: one upper case, one lower case, one number, and one special character',
						},
					});
			});

			it('responds with 400 when email is already taken', () => {
				const duplicateEmail = {
					first_name: 'test first name',
					last_name: 'test last name',
					email: testUsers[0].email,
					password: '11AAaabbcc!!',
				};

				return supertest(app)
					.post('/api/reflections/users')
					.send(duplicateEmail)
					.expect(400, { error: { message: 'Email already taken' } });
			});
		});

		context('Happy path', () => {
			it('responds with 201, serialized user, storing bcrypted password', () => {
				const newUser = {
					first_name: 'test first name',
					last_name: 'test last name',
					email: 'testuser@email.com',
					password: '11TT2233!!',
				};

				return supertest(app)
					.post('/api/reflections/users')
					.send(newUser)
					.expect(201)
					.expect(res => {
						expect(res.body).to.have.property('id');
						expect(res.body.first_name).to.eql(newUser.first_name);
						expect(res.body.last_name).to.eql(newUser.last_name);
						expect(res.body.email).to.eql(newUser.email);
						expect(res.body).to.not.have.property('password');
						expect(res.headers.location).to.eql(
							`/api/reflections/${res.body.id}`
						);
					})
					.expect(res => {
						db.from('users')
							.select('*')
							.where({ id: res.body.id })
							.first()
							.then(row => {
								expect(row.first_name).to.eql(newUser.first_name);
								expect(row.last_name).to.eql(newUser.last_name);
								expect(row.email).to.eql(newUser.email);

								return bcrypt.compare(newUser.password, row.password);
							})
							.then(compareMatch => {
								expect(compareMatch).to.be.true;
							});
					});
			});
		});
	});
});
