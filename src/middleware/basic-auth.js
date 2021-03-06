const AuthService = require('../auth/auth-service');

function requireAuth(req, res, next) {
	const authToken = req.get('Authorization') || '';

	let basicToken;
	if (!authToken.toLowerCase().startsWith('basic')) {
		return res.status(401).json({ error: 'Missing basic token' });
	} else {
		basicToken = authToken.slice('basic'.length, authToken.length);
	}

	const [tokenEmail, tokenPassword] = AuthService.parseBasicToken(basicToken);

	if (!tokenEmail || !tokenPassword) {
		return res.status(401).json({ error: 'Unauthorized request' });
	}

	AuthService.getUserWithEmail(req.app.get('db'), tokenEmail).then(user => {
		if (!user) {
			return res.status(401).json({ error: 'Unauthorized request' });
		}

		return AuthService.comparePasswords(tokenPassword, user.password).then(
			passwordsMatch => {
				if (!passwordsMatch) {
					return res.status(401).json({ error: 'Unauthorized request' });
				}

				req.user = user;
				next();
			}
		);
	});
}

module.exports = {
	requireAuth,
};
