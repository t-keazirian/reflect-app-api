function makeUsersArray() {
	return [
		{
			id: 1,
			first_name: 'test-user1',
			last_name: 'last-user-1',
			email: 'tu1@email.com',
			password: 'passworD1!',
		},
		{
			id: 2,
			first_name: 'test-user2',
			last_name: 'last-user2',
			email: 'tu2@email.com',
			password: 'password2',
		},
		{
			id: 3,
			first_name: 'test-user3',
			last_name: 'last-user3',
			email: 'tu3@email.com',
			password: 'password3',
		},
	];
}

module.exports = { makeUsersArray };
