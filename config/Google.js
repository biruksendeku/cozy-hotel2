require('dotenv').config();

const GoogleStratrgy = require('passport-google-oauth20').Strategy;

const User = require('../models/User');

module.exports = function configurePassportGoogle(passport) {
	passport.use(new GoogleStratrgy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_CALLBACK_URL,
			profileFields: [ 'email', 'displayName', 'id', 'avatar' ]
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const user = await User.findOne({ googleId: profile.id });
				if(user) {
					return done(null, user);
				}
				const newUser = new User({
					name: profile.displayName ? profile.displayName : `GoogleUser-${Date.now()}`,
					email: profile.emails ? profile.emails[0]?.value : null,
					googleId: profile.id,
					avatar: profile.photos ? profile.photos[0]?.value : null,
					isVerified: true,
					verifiedAt: new Date()
				});
				newUser.authProvider.push('google');
				await newUser.save();
				done(null, newUser);
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
