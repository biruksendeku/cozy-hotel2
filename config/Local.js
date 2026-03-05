const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');

const bcrypt = require('bcryptjs');

module.exports = function configurePassport(passport) {
	passport.use(new LocalStrategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true
		},
		async (req, email, password, done) => {
			try {
				if(!email || !password) {
					req.flash('error', 'Missing Credentials');
					return done(null, false);
			    }
			    const user = await User.findOne({ email });
			    if(!user) {
			    	req.flash('error', 'Email not registered');
			    	return done(null, false);
			    }
			    const lastUsedProviderRaw = user.authProvider[user.authProvider.length - 1];
			    const lastUsedProvider = lastUsedProviderRaw.trim();
			    const provider = lastUsedProvider.charAt(0).toUpperCase() + lastUsedProvider.slice(1).toLowerCase();
			    if(user.password === null) {
			    	req.flash('error', `Signup or use your last Auth Provider ${provider}`);
			    	return done(null, false);
			    }
			    const isValid = await bcrypt.compare(password, user.password);
			    if(!isValid) {
			    	req.flash('error', 'Incorrect email or password');
			    	return done(null, false);
			    }
			    done(null, user);
			} catch(err) {
				done(err);
			}
		}
	));
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser(async (id, done) => {
		try {
			const user = await User.findById(id);
			done(null, user);
		} catch(err) {
			done(err);
		}
	});
};
