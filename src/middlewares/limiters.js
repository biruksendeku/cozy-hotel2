const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');

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

const emailLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 3,
	keyGenerator: (req) => {
		const email = req.body && req.body.email;
		if (typeof email === 'string' && email.trim()) {
			return `email:${email.trim().toLowerCase()}`;
		}
		return `ip:${ipKeyGenerator(req.ip || '')}`;
	},
	message: 'Too many email requests. Try again later.'
});

module.exports = {
	apiLimiter,
	authLimiter,
	publicLimiter,
	emailLimiter
};
