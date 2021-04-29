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
});

module.exports = reflectionsRouter;
