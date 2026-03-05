require('dotenv').config();

const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET_KEY,
	resave: false, // dont resave without changes
	saveUninitialized: false,

	store: new MongoStore({
		mongoUrl: process.env.MONGODB_URI,
		collectionName: 'sessions',
		ttl: 7 * 24 * 60 * 60, // 7 days in seconds
		autoRemove: 'native' // default interval to check for expired sessions
	}),
	rolling: true,
	cookie: {
		httpOnly: true,
		secure: process.env.NODE_ENV !== 'development',
		sameSite: process.env.NODE_ENV !== 'development' ? 'none' : 'lax',
		maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
	}
});

module.exports = sessionMiddleware
