const ReflectionsService = {
	getAllMeditations(knex, query, user_id) {
		return knex
			.select('*')
			.from('meditations')
			.where({ user_id })
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

	updateMeditation(knex, id, newMeditationFields) {
		return knex.from('meditations').where({ id }).update(newMeditationFields);
	},

	deleteMeditation(knex, id) {
		return knex.from('meditations').where({ id }).delete();
	},
};

module.exports = ReflectionsService;
