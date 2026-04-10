const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const User = require("../models/user");
const {
  sendVerificationEmail,
  resetApprovalEmail,
  resetSuccessfulEmail,
} = require("./email");
const hashToken = require("../utils/hashToken");
const NotFoundError = require("../middlewares/errors/notFoundError");

async function verifyEmail(req, res, next) {
  try {
    const user = await User.findOne({
      verificationToken: hashToken(req.params.token),
      verificationExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.render("resend");
    }
    if (user.isVerified) {
      return res.status(400).send("User already verified.");
    }

    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    user.isVerified = true;
    user.verifiedAt = new Date();
    user.authProvider.push("local");
    await user.save();

    req.login(user, (err) => {
      if (err) return next(err);
      res.redirect("/");
    });
  } catch (err) {
    next(err);
  }
}

function renderResendVerification(req, res) {
  res.render("resend");
}

async function resendVerification(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/api/resend/verification/link");
    }

    const { email } = req.body;
    if (!email) {
      req.flash("error", "Email field required");
      return res.redirect("/api/resend/verification/link");
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Email not registered");
      return res.redirect("/api/resend/verification/link");
    }
    if (user.isVerified) {
      req.flash("error", "Email already verified");
      return res.redirect("/api/resend/verification/link");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = hashToken(verificationToken);
    user.verificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    await sendVerificationEmail(email, verificationToken);
    res
      .status(200)
      .send("Verification email sent. Check your email to verify account");
  } catch (err) {
    next(err);
  }
}

function renderPasswordReset(req, res) {
  res.render("reset");
}

async function requestPasswordReset(req, res, next) {
  try {
    const { email, newPassword } = req.body;
    if (!email) {
      req.flash("error", "Email field required");
      return res.redirect("/api/reset/password");
    }
    if (!newPassword) {
      req.flash("error", "New password field required");
      return res.redirect("/api/reset/password");
    }

    const user = await User.findOne({ email });
    if (!user) {
      req.flash("error", "Email not registered");
      return res.redirect("/api/reset/password");
    }
    if (!user.isVerified) {
      req.flash("error", "Email must be verified, Signup first");
      return res.redirect("/api/reset/password");
    }
    if (user.password === null) {
      req.flash(
        "error",
        "Sign up or use your existing authentication provider",
      );
      return res.redirect("/api/reset/password");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetToken = hashToken(resetToken);
    user.resetExpires = Date.now() + 24 * 60 * 60 * 1000;
    user.newPassword = await bcrypt.hash(newPassword, 10);
    await user.save();
    await resetApprovalEmail(email, resetToken);
    res
      .status(200)
      .send("Reset approval link sent, check your email to approve");
  } catch (err) {
    next(err);
  }
}

async function approvePasswordReset(req, res, next) {
  try {
    const user = await User.findOne({
      resetToken: hashToken(req.params.token),
      resetExpires: { $gt: Date.now() },
    });
    if (!user) {
      req.flash(
        "error",
        "Email not registered, make sure you entered the correct email address",
      );
      return res.redirect("back");
    }
    if (!user.isVerified) {
      req.flash("error", "Unverified email, sign up and verify first");
      return res.redirect("back");
    }

    user.password = user.newPassword;
    user.newPassword = null;
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    await resetSuccessfulEmail(user.email);
    res.redirect("/auth/login");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  verifyEmail,
  renderResendVerification,
  resendVerification,
  renderPasswordReset,
  requestPasswordReset,
  approvePasswordReset,
};
