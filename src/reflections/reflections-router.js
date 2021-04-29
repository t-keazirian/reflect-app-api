const express = require('express');
const path = require('path');
const ReflectionsService = require('./reflections-service');

const reflectionsRouter = express.Router();
const jsonParser = express.json();

reflectionsRouter
	.route('/')
	.get((req, res, next) => {
		ReflectionsService.getAllMeditations(req.app.get('db'))
			.then(meditations => {
				res.json(meditations);
			})
			.catch(next);
	})
	.post(jsonParser, (req, res, next) => {
		const { description, minutes, current_mood, notes } = req.body;
		const newMeditation = { description, minutes, current_mood, notes };

		for (const [key, value] of Object.entries(newMeditation)) {
			if (value == null) {
				return res.status(400).json({
					error: { message: `Missing ${key} in request body` },
				});
			}
		}
		ReflectionsService.insertMeditation(req.app.get('db'), newMeditation)
			.then(meditation => {
				res
					.status(201)
					.location(path.posix.join(req.originalUrl, `/${meditation.id}`))
					.json(meditation);
			})
			.catch(next);
	});

reflectionsRouter
	.route('/:id')
	.all((req, res, next) => {
		ReflectionsService.getMeditationById(req.app.get('db'), req.params.id)
			.then(meditation => {
				if (!meditation) {
					return res.status(404).json({
						error: { message: `Meditation doesn't exist` },
					});
				}
				res.meditation = meditation;
				next();
			})
			.catch(next);
	})
	.get((req, res, next) => {
		res.json({
			id: res.meditation.id,
			description: res.meditation.description,
			minutes: res.meditation.minutes,
			current_mood: res.meditation.current_mood,
			notes: res.meditation.notes,
			date: res.meditation.date,
		});
	});

// should I do something besides .end() here? I tried to .json send a message but it didn't work
  reflectionsRouter
    .route('/:id').delete((req, res, next) => {
	    ReflectionsService.deleteMeditation(req.app.get('db'), req.params.id)
		.then(() => {
			res.status(204).end();
		})
		.catch(next);
});

module.exports = reflectionsRouter;
