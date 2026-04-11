const GoogleStrategy = require("passport-google-oauth20").Strategy;

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } =
  process.env;
const User = require("../../models/user");

module.exports = function configurePassportGoogle(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
        profileFields: ["email", "displayName", "id", "avatar"],
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          const googleUser = await User.findOne({ googleId: profile.id });
          if (googleUser) {
            return done(null, googleUser);
          }

          const email = profile.emails?.[0]?.value;
          if (typeof email !== "string" || !email.trim()) {
            req.flash(
              "error",
              "Your Google account must provide an email address to sign in",
            );
            return done(null, false);
          }
          const normalizedEmail = email.trim().toLowerCase();
          const existingUser = await User.findOne({
            email: normalizedEmail,
          });
          if (existingUser) {
            existingUser.googleId = profile.id;
            if (!Array.isArray(existingUser.authProvider)) {
              existingUser.authProvider = [];
            }
            if (!existingUser.authProvider.includes("google")) {
              existingUser.authProvider.push("google");
            }
            await existingUser.save();
            return done(null, existingUser);
          }

          const newUser = new User({
            name: profile.displayName
              ? profile.displayName
              : `GoogleUser-${Date.now()}`,
            email: normalizedEmail,
            googleId: profile.id,
            avatar: profile.photos ? profile.photos[0]?.value : null,
            isVerified: true,
            verifiedAt: new Date(),
          });
          newUser.authProvider.push("google");
          await newUser.save();
          done(null, newUser);
        } catch (err) {
          done(err);
        }
      },
    ),
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
