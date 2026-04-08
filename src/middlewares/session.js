const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const { SESSION_SECRET_KEY, MONGODB_URI } = process.env;

const store = new MongoStore({
  mongoUrl: MONGODB_URI,
  collectionName: "sessions",
  ttl: 7 * 24 * 60 * 60,
  autoRemove: "native",
});

store.on("error", (error) => {
  console.error("Session store error:", error);
});

const sessionMiddleware = session({
  secret: SESSION_SECRET_KEY,
  resave: false, // dont resave without changes
  saveUninitialized: false,

  store,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
});

module.exports = sessionMiddleware;
