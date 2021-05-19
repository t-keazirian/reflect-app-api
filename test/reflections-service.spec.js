const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const knex = require('knex');
const { makeMeditationsArray } = require('./reflections.fixtures');
const { makeUsersArray } = require('./users.fixtures');
const { makeAuthHeader } = require('./auth-helper.fixtures');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

describe('Reflections endpoint', () => {
	let db;
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

	describe('Unauthorized requests', () => {
		const testMeditations = makeMeditationsArray();
		const testUsers = makeUsersArray();

		beforeEach('insert users and meditations', () => {
			return db
				.into('users')
				.insert(testUsers)
				.then(() => db.into('meditations').insert(testMeditations));
		});

		it(`responds with 401 'Missing bearer token' for GET /api/reflections`, () => {
			return supertest(app)
				.get('/api/reflections/123456')
				.expect(401, { error: { message: 'Missing bearer token' } });
		});
	});

	describe('GET /api/reflections/:user_id', () => {
		const testMeditations = makeMeditationsArray();
		const testUsers = makeUsersArray();
		const authToken = makeAuthHeader(testUsers[0]);
		const userId = testUsers[0].id;
		const expectedMeditations = testMeditations.filter(
			meditation => meditation.user_id === userId
		);

		before('insert users and meditations', () => {
			return db
				.into('users')
				.insert(testUsers)
				.then(() => db.into('meditations').insert(testMeditations));
		});

		// before('login auth', () => {
		// 	const loginUser = {
		// 		email: testUsers[0].email,
		// 		password: 'passworD1!',
		// 	};

		// 	return supertest(app)
		// 		.post(`/api/auth/login`)
		// 		.send(loginUser)
		// 		.then(res => {
		// 			authToken = res.body.authToken;
		// 		});
		// });

		context('Given no meditations', () => {
			it('responds with 200 and an empty list', () => {
				return supertest(app)
					.get(`/api/reflections/3`)
					.set('Authorization', authToken)
					.expect(200, []);
			});
		});

		context('Given there are meditations in the db', () => {
			beforeEach('insert meditations', () => {
				return db
					.into('users')
					.insert(testUsers)
					.then(() => db.into('meditations').insert(testMeditations));
			});

			it('responds with 200 and all the meditations', () => {
				return supertest(app)
					.get(`/api/reflections/${userId}`)
					.set('Authorization', authToken)
					.expect(200, expectedMeditations);
			});
		});
	});

	describe('POST /api/reflections', () => {
		const testMeditations = makeMeditationsArray();
		const testUsers = makeUsersArray();
		const authToken = makeAuthHeader(testUsers[0]);
		const userId = testUsers[0].id;
		const expectedMeditations = testMeditations.filter(
			meditation => meditation.user_id === userId
		);

		before('insert users and meditations', () => {
			return db
				.into('users')
				.insert(testUsers)
				.then(() => db.into('meditations').insert(testMeditations));
		});

		it('creates a new meditation, responding with 201 and the new meditation', () => {
			// beforeEach('insert meditations', () => {
			// 	return db
			// 		.into('users')
			// 		.insert(testUsers)
			// 		.then(() => db.into('meditations').insert(testMeditations));
			// });
			const newMeditation = {
				description: 'inspired',
				minutes: 5,
				notes: 'test notes',
				current_mood: 'happy',
				// user_id: 1
			};

			return supertest(app)
				.post(`/api/reflections/${userId}`)
				.set('Authorization', authToken)
				.send(newMeditation)
				.expect(201)
				.expect(res => {
					expect(res.body.description).to.eql(newMeditation.description);
					expect(res.body.minutes).to.eql(newMeditation.minutes);
					expect(res.body.notes).to.eql(newMeditation.notes);
					expect(res.body.current_mood).to.eql(newMeditation.current_mood);
					expect(res.body).to.have.property('id');
				})
				// .then(postRes => {
				// 	supertest(app).get(`/api/reflections/${postRes.body.id}`);
				// 	expect(postRes.body);
				// });
		});

		const requiredFields = ['description', 'current_mood', 'notes'];

		requiredFields.forEach(field => {
			const newMeditation = {
				description: 'inspired',
				notes: 'test notes',
				minutes: 5,
				current_mood: 'happy',
			};

			it(`responds with 400 and an error message when the ${field} is missing`, () => {
				delete newMeditation[field];

				return supertest(app)
					.post('/api/reflections')
					.send(newMeditation)
					.expect(400, {
						error: { message: `Missing ${field} in request body` },
					});
			});
		});

		/*

		context('Given an XSS attack', () => {
			it('removes XSS attack content', () => {
				const maliciousReflection = {
					id: 911,
					description:
						'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
					notes: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
					current_mood: 'sad',
					minutes: 5,
				};
				const expectedMeditation = {
					...maliciousReflection,
					description:
						'Naughty naughty very naughty &lt;script&gt;alert("xss");&lt;/script&gt;',
					notes: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
					current_mood: 'sad',
					minutes: 5,
				};
				return supertest(app)
					.post(`/api/reflections`)
					.send(maliciousReflection)
					.expect(201)
					.expect(res => {
						expect(res.body.description).to.eql(expectedMeditation.description);
						expect(res.body.current_mood).to.eql(
							expectedMeditation.current_mood
						);
						expect(res.body.notes).to.eql(expectedMeditation.notes);
					});
			});
		});
	});

	

	describe('DELETE /api/reflections/:id', () => {
		context('Given no meditations', () => {
			it('responds with 404', () => {
				const id = 12345;
				return supertest(app)
					.delete(`/api/reflections/${id}`)
					.expect(404, { error: { message: `Meditation doesn't exist` } });
			});
		});

		context('Given there are meditations in the db', () => {
			const testMeditations = makeMeditationsArray();
			beforeEach('insert meditations', () => {
				return db.into('meditations').insert(testMeditations);
			});

			it('responds with 204 and removes the goal', () => {
				const idToRemove = 2;
				const expectedMeditations = testMeditations.filter(
					meditation => meditation.id !== idToRemove
				);

				return supertest(app)
					.delete(`/api/reflections/${idToRemove}`)
					.expect(204)
					.then(res => {
						supertest(app).get('/api/reflections').expect(expectedMeditations);
					});
			});
		});
		*/
	});

	describe('GET /api/reflections/:id', () => {
		context('Given no meditations', () => {
			it('responds with 404', () => {
				const id = 12345;
				return supertest(app)
					.get(`/api/reflections/${id}`)
					.expect(404, { error: { message: `Meditation doesn't exist` } });
			});
		});

		context('Given there are meditations in the db', () => {
			const testMeditations = makeMeditationsArray();
			beforeEach('insert meditations', () => {
				return db.into('meditations').insert(testMeditations);
			});

			it('responds with 200 and the specified goal', () => {
				const id = 3;
				const expectedMeditation = testMeditations[id - 1];
				return supertest(app)
					.get(`/api/reflections/${id}`)
					.expect(200, expectedMeditation);
			});
		});

		context('Given an XSS attack', () => {
			const maliciousReflection = {
				id: 911,
				description: 'Bad',
				current_mood: 'sad',
				notes: 'Bad notes',
			};

			beforeEach('insert malicious reflection', () => {
				return db.into('meditations').insert(maliciousReflection);
			});

			it('removes XSS attack content', () => {
				return supertest(app)
					.get(`/api/reflections/${maliciousReflection.id}`)
					.expect(200)
					.expect(res => {
						expect(res.body.description).to.eql('Bad');
						expect(res.body.current_mood).to.eql('sad');
						expect(res.body.notes).to.eql('Bad notes');
					});
			});
		});
	});

	describe('PATCH /api/reflections/:id', () => {
		context('Given no meditations', () => {
			it('responds with 404', () => {
				const id = 12345;
				return supertest(app)
					.patch(`/api/reflections/${id}`)
					.expect(404, { error: { message: `Meditation doesn't exist` } });
			});
		});

		context('Given there are meditations in the db', () => {
			const testMeditations = makeMeditationsArray();
			beforeEach('insert meditations', () => {
				return db.into('meditations').insert(testMeditations);
			});

			it('responds with 204 and the updated goal', () => {
				const idToUpdate = 1;
				const updatedMeditation = {
					description: 'Updated description',
				};
				const expectedMeditation = {
					...testMeditations[idToUpdate - 1],
					...updatedMeditation,
				};

				return supertest(app)
					.patch(`/api/reflections/${idToUpdate}`)
					.send(updatedMeditation)
					.expect(204)
					.then(res => {
						supertest(app)
							.get(`/api/reflections/${idToUpdate}`)
							.expect(expectedMeditation);
					});
			});
		});
	});
});
