const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const { sendVerificationEmail } = require("./email");
const User = require("../models/user");

function renderSignup(req, res) {
  res.render("signup");
}

async function signup(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/auth/signup");
    }

    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      req.flash("error", "Missing Credentials");
      return res.redirect("/auth/signup");
    }

    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      req.flash("error", "Email already registered");
      return res.redirect("/auth/signup");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const user = new User({
      name,
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      verificationToken,
      verificationDate: Date.now() + 24 * 60 * 60 * 1000,
      isVerified: false,
    });

    await user.save();
    await sendVerificationEmail(normalizedEmail, verificationToken);
    res.status(201).send("<h2>Verification email sent, check your email.</h2>");
  } catch (err) {
    next(err);
  }
}

function renderLogin(req, res) {
  res.render("login");
}

function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      req.flash("error", errors.array()[0].msg);
      return res.redirect("/auth/login");
    }
    res.redirect("/");
  } catch (err) {
    next(err);
  }
}

module.exports = {
  renderSignup,
  signup,
  renderLogin,
  login,
};
