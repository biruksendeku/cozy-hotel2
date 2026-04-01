const LocalStrategy = require("passport-local").Strategy;
const User = require("../../models/user");

const bcrypt = require("bcryptjs");

module.exports = function configurePassport(passport) {
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (req, email, password, done) => {
        try {
          if (!email || !password) {
            req.flash("error", "Missing Credentials");
            return done(null, false);
          }
          const user = await User.findOne({ email });
          if (!user) {
            req.flash("error", "Email not registered");
            return done(null, false);
          }
          if (user.password === null) {
            const authProviders = Array.isArray(user.authProvider)
              ? user.authProvider
              : [];
            const lastUsedProviderRaw =
              authProviders[authProviders.length - 1];
            const lastUsedProvider =
              typeof lastUsedProviderRaw === "string"
                ? lastUsedProviderRaw.trim()
                : "";

            if (!lastUsedProvider) {
              req.flash("error", "Use your sign-in provider or sign up");
              return done(null, false);
            }

            const provider =
              lastUsedProvider.charAt(0).toUpperCase() +
              lastUsedProvider.slice(1).toLowerCase();
            req.flash(
              "error",
              `Signup or use your last Auth Provider ${provider}`,
            );
            return done(null, false);
          }
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            req.flash("error", "Incorrect email or password");
            return done(null, false);
          }
          if (!user.isVerified) {
            req.flash("error", "Verify your email first");
            return done(null, false);
          }
          done(null, user);
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
