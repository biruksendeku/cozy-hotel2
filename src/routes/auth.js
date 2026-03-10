const { body } = require("express-validator");

const authController = require("../controllers/auth");

module.exports = function authRoutes(passport) {
  const router = require("express").Router();

  router.get("/auth/signup", authController.renderSignup);

  router.post(
    "/auth/signup",
    [
      body("name").escape().trim().notEmpty().withMessage("Name field required"),
      body("email")
        .escape()
        .trim()
        .notEmpty()
        .withMessage("Email field required")
        .isEmail()
        .normalizeEmail()
        .withMessage("Invalid email address"),
      body("password")
        .trim()
        .notEmpty()
        .withMessage("Password field required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
      body("confirmPassword")
        .trim()
        .notEmpty()
        .withMessage("Confirmation password required")
        .isLength({ min: 6 })
        .withMessage("Password must be at least 6 characters long"),
    ],
    authController.signup,
  );

  router.get("/auth/login", authController.renderLogin);

  router.post(
    "/auth/login",
    [
      body("email")
        .trim()
        .escape()
        .notEmpty()
        .withMessage("Email field required")
        .isEmail()
        .normalizeEmail()
        .withMessage("Invalid email address"),
      body("password").trim().notEmpty().withMessage("Password field required"),
    ],
    passport.authenticate("local", {
      failureRedirect: "/auth/login",
      failureFlash: true,
      successFlash: true,
    }),
    authController.login,
  );

  router.get(
    "/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
  );

  router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
      failureRedirect: "/auth/login",
      successRedirect: "/",
    }),
  );

  router.get(
    "/auth/facebook",
    passport.authenticate("facebook", { scope: ["profile", "email"] }),
  );

  router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
      failureRedirect: "/auth/login",
      successRedirect: "/",
    }),
  );

  return router;
};
