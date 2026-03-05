require('dotenv').config();

const FacebookStrategy = require('passport-facebook').Strategy;

const User = require('../models/User');

module.exports = function configurePassportFacebook(passport) {
	passport.use(new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: process.env.FACEBOOK_CALLBACK_URL,
			profileFields: [ 'email', 'displayName', 'id', 'avatar' ]
		},
		async (accessToken, refreshToken, profile, done) => {
			try{
				const user = await User.findOne({ facebookId: profile.id });
				if(user) {
					return done(user);
				}
				const newUser = new User({
					name: profile.displayName ? profile.displayName : `FacebookUser-${Date.now()}`,
					email: profile.emails ? profile.emails[0]?.value : null,
					facebookId: profile.id,
					avatar: profile.photos ? profile.photos[0]?.value : null,
					isVerified: true,
					verifiedAt: new Date()
				});
				newUser.authProvider.push('facebook');
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
