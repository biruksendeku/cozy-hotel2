const { body } = require("express-validator");

const apiController = require("../controllers/api");

module.exports = function apiRoutes() {
  const router = require("express").Router();

  router.get("/api/verify/email/:token", apiController.verifyEmail);

  router.get(
    "/api/resend/verification/link",
    apiController.renderResendVerification,
  );
  router.post(
    "/api/resend/verification/link",
    [
      body("email")
        .notEmpty()
        .withMessage("Email field required")
        .isEmail()
        .normalizeEmail()
        .withMessage("Invalid email address"),
    ],
    apiController.resendVerification,
  );

  router.get("/api/request/reset/password", apiController.renderPasswordReset);
  router.post(
    "/api/request/reset/approve/password",
    apiController.requestPasswordReset,
  );
  router.get(
    "/api/request/reset/approve/password/:token",
    apiController.approvePasswordReset,
  );

  return router;
};
