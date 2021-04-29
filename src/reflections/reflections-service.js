const ReflectionsService = {

	getAllMeditations(knex) {
		return knex
      .select('*')
      .from('meditations');
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

	// does it matter if I put .from first or .select first?

	getMeditationById(knex, id) {
		return knex
      .from('meditations')
      .select('*')
      .where('id', id)
      .first();
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

  // should I do anything besides delete()

  deleteMeditation(knex, id) {
    return knex
      .from('meditations')
      .where({id})
      .delete()
  }
};

module.exports = ReflectionsService;