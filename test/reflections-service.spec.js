// did I write the migrations and the seeds correctly?

const { expect } = require('chai');
const supertest = require('supertest');
const app = require('../src/app');
const knex = require('knex');
const { makeMeditationsArray } = require('./reflections.fixtures');

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
	before('clean table', () => db('meditations').truncate());
	afterEach('cleanup', () => db('meditations').truncate());

	describe('GET /api/reflections', () => {
		context('Given no meditations', () => {
			it('responds with 200 and an empty list', () => {
				return supertest(app).get('/api/reflections').expect(200, []);
			});
		});

		context('Given there are meditations in the db', () => {
			const testMeditations = makeMeditationsArray();

			beforeEach('insert meditations', () => {
				return db.into('meditations').insert(testMeditations);
			});

			it('responds with 200 and all the meditations', () => {
				return supertest(app)
					.get('/api/reflections')
					.expect(200, testMeditations);
			});
		});
	});

	describe('POST /api/reflections', () => {
		it('creates a new meditation, responding with 201 and the new meditation', () => {
			const newMeditation = {
				description: 'inspired',
				minutes: 5,
				notes: 'test notes',
				current_mood: 'happy',
			};

			return supertest(app)
				.post('/api/reflections')
				.send(newMeditation)
				.expect(201)
				.expect(res => {
					expect(res.body.description).to.eql(newMeditation.description);
					expect(res.body.minutes).to.eql(newMeditation.minutes);
					expect(res.body.notes).to.eql(newMeditation.notes);
					expect(res.body.current_mood).to.eql(newMeditation.current_mood);
					expect(res.body).to.have.property('id');
					expect(res.headers.location).to.eql(
						`/api/reflections/${res.body.id}`
					);
				})
				.then(postRes => {
					supertest(app).get(`/api/reflections/${postRes.body.id}`);
					expect(postRes.body);
				});
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
