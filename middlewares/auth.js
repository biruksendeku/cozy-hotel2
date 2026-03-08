const ForbiddenError = require("./errors/forbiddenError");

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
		if(!req.user || !req.user.isAdmin) {
			return next(new ForbiddenError());
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
