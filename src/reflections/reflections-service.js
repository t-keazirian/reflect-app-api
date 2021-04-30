const ReflectionsService = {
	getAllMeditations(knex, query) {
		// check query for white listed keys
		return knex
			.select('*')
			.from('meditations')
			.modify(queryBuilder => {
				if (query.mood) {
					queryBuilder.where('current_mood', query.mood);
				}
			});
	},

	insertMeditation(knex, newReflection) {
		return knex
			.insert(newReflection)
			.into('meditations')
			.returning('*')
			.then(rows => {
				return rows[0];
			});
	},

	getMeditationById(knex, id) {
		return knex.from('meditations').select('*').where('id', id).first();
	},

	// check on this one??
	getMeditationByMood(knex, mood) {
		return knex
			.from('meditations')
			.select('*')
			.where('mood', mood)
			.then(rows => {
				return rows;
			});
	},

	// add .put()

	deleteMeditation(knex, id) {
		return knex.from('meditations').where({ id }).delete();
	},
};

module.exports = ReflectionsService;
