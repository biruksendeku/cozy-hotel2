const { body } = require("express-validator");

const apiController = require("../controllers/api");
const { emailLimiter } = require("../middlewares/limiters");

module.exports = function apiRoutes() {
  const router = require("express").Router();

  router.get("/api/verify/email/:token", apiController.verifyEmail);

  router.get(
    "/api/resend/verification/link",
    apiController.renderResendVerification,
  );
  router.post(
    "/api/resend/verification/link",
    emailLimiter,
    [
      body("email")
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
    ],
    apiController.resendVerification,
  );

  router.get("/api/request/reset/password", apiController.renderPasswordReset);
  router.post(
    "/api/request/reset/password",
    emailLimiter,
    [
      body("email")
        .notEmpty()
        .withMessage("Email field required")
        .isEmail()
        .normalizeEmail()
        .withMessage("Invalid email address"),
    ],
    apiController.requestPasswordReset,
  );
  router.get(
    "/api/request/reset/approve/password/:token",
    apiController.approvePasswordReset,
  );

  return router;
};
