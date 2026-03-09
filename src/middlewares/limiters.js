const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 mins
	max: 10,
	message: 'Too many requests. Try again later.'
});

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 mins
	max: 6,
	message: 'Too many requests. Try again later.'
});

const publicLimiter = rateLimit({
	windowMs: 1 * 60 * 1000, // 1 min
	max: 70,
	message: 'Too many requests. Try again later.'
});

module.exports = {
	apiLimiter,
	authLimiter,
	publicLimiter
};
