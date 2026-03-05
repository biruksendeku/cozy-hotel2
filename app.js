require('dotenv').config();

const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const path = require('path');

const authRoutes = require('./routes/Auth');
// const apiRoutes = require('./routes/Api');
const adminRoutes = require('./routes/Admin');
const foodRoutes = require('./routes/Food');
const sessionMiddleware = require('./middlewares/session');
const {
	authLimiter,
	apiLimiter,
	publicLimiter
} = require('./middlewares/limiters');
const { isAdmin, isLoggedIn } = require('./middlewares/auth');
const configureLocal = require('./config/Local');
const configureGoogle = require('./config/Google');
const configureFacebook = require('./config/Facebook');

const app = express();
const publicFolder = path.join(__dirname, 'public');

app.set('view engine', 'ejs');
app.set('view cache', false);

app.use(compression({
	level: 6,
	treshold: 1024
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicFolder));
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(flash());
app.use((req, res, next) => {
	res.locals.error = req.flash('error');
	res.locals.errors = req.flash('errors');
	res.locals.success = req.flash('success');
	next();
});
app.use((req, res, next) => {
	if(!req.session.cart) {
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

/*
app.delete('/foods/:id', async (req, res, next) => {
	try {
		const id = req.params.id.toString();
		Food.findByIdAndDelete(id)
		.then(() => {
			res.json({
				message: "Food Deleted",
				id
			})
		})
		.catch((err) => {
			res.json({
				message: "Failed to Delete food",
				error: err.message,
				id
			});
		});
	} catch(err) {
		next(err);
	}
});
*/

app.use('/', authRoutes(passport));
// app.use('/', apiRoutes());
app.use('/', /*isLoggedIn, isAdmin,*/ adminRoutes());
app.use('/', isLoggedIn, foodRoutes());

app.use((req, res, next) => {
	try {
		res.status(404).send('<h1> 404 - Page Not Found </h1>');
	} catch(err) {
		next(err);
	}
});

app.use((err, req, res, next) => {
	if(process.env.NODE_ENV === 'development') {
		console.log('Error Message: ', err.message);
		console.log('Error Stack: ', err.stack);
		return res.status(500).send('Internal Server Error');
	}
	res.json({ error: err.message });
});

module.exports = app;
