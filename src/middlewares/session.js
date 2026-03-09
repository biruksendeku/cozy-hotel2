const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const { SESSION_SECRET_KEY, MONGODB_URI, NODE_ENV } = process.env;

const sessionMiddleware = session({
  secret: SESSION_SECRET_KEY,
  resave: false, // dont resave without changes
  saveUninitialized: false,

  store: new MongoStore({
    mongoUrl: MONGODB_URI,
    collectionName: "sessions",
    ttl: 7 * 24 * 60 * 60, // 7 days in seconds
    autoRemove: "native", // default interval to check for expired sessions
  }),
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: NODE_ENV !== "development",
    sameSite: NODE_ENV !== "development" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

module.exports = sessionMiddleware;
