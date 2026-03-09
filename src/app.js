const express = require("express");
const passport = require("passport");
const flash = require("connect-flash");
const cookieParser = require("cookie-parser");
const compression = require("compression");

const path = require("path");

const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");
const adminRoutes = require("./routes/admin");
const foodRoutes = require("./routes/food");
const sessionMiddleware = require("../middlewares/session");
const {
  authLimiter,
  apiLimiter,
  publicLimiter,
} = require("../middlewares/limiters");
const { isAdmin, isLoggedIn } = require("../middlewares/auth");
const AppError = require("../middlewares/errors/appError");
const NotFoundError = require("../middlewares/errors/notFoundError");
const configureLocal = require("./config/passport/local");
const configureGoogle = require("./config/passport/google");
const configureFacebook = require("./config/passport/facebook");

const app = express();
const publicFolder = path.join(__dirname, "public");

app.set("view engine", "ejs");
app.set("view cache", false);

app.use(
  compression({
    level: 6,
    treshold: 1024,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicFolder));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(flash());
app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.errors = req.flash("errors");
  res.locals.success = req.flash("success");
  next();
});
app.use((req, res, next) => {
  if (!req.session.cart) {
    req.session.cart = [];
  }
  res.locals.cart = req.session.cart;
  next();
});

configureLocal(passport);
configureGoogle(passport);
configureFacebook(passport);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes(passport));
app.use("/", apiRoutes());
app.use("/", isLoggedIn, isAdmin, adminRoutes());
app.use("/", isLoggedIn, foodRoutes());

app.use((req, res, next) => {
  next(new NotFoundError("Route not found"));
});

app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Error Message: ", err.message);
    console.log("Error Stack: ", err.stack);
  }

  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = isAppError ? err.message : "Internal Server Error";

  res.status(statusCode).json({ error: message });
});

module.exports = app;
