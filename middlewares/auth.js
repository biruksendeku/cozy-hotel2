const isLoggedIn = (req, res, next) => {
	try {
		if(!req.isAuthenticated()) {
			return res.redirect('/auth/login');
		}
		next();
	} catch(err) {
		next(err);
	}
};

const isAdmin = (req, res, next) => {
	try {
		if(!req.user.isAdmin) {
			return res.status(403).send('Forbidden');
		}
		next();
	} catch(err) {
		next(err);
	}
};

module.exports = {
	isLoggedIn,
	isAdmin
};
