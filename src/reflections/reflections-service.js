const ReflectionsService = {

	getAllMeditations(knex) {
		return knex
      .select('*')
      .from('reflections');
	},

	insertMeditation(knex, newReflection) {
		return knex
			.insert(newReflection)
			.into('reflections')
			.returning('*')
			.then(rows => {
				return rows[0];
			});
	},

	// does it matter if I put .from first or .select first?

	getMeditationById(knex, id) {
		return knex.from('reflections').select('*').where('id', id).first();
	},

	// check on this one??
	getMeditationByMood(knex, mood) {
		return knex
			.from('reflections')
			.select('*')
			.where('mood', mood)
			.then(rows => {
				return rows;
			});
	},
};

module.exports = ReflectionsService;