const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');

const { sendVerificationEmail } = require('../controllers/Email');
const User = require('../models/User');

module.exports = function authRoutes(passport) {

        const router = require('express').Router();

        router.get('/auth/signup', (req, res, next) => {
        	console.log('passport: ', passport);
                try {
                        res.render('signup');
                } catch(err) {
                        next(err);
                }
        });

        router.post('/auth/signup', [
                body('name')
                .escape()
                .trim()
                .notEmpty()
                .withMessage('Name field required'),
                body('email')
                .escape()
                .trim()
                .notEmpty()
                .withMessage('Email field required')
                .isEmail()
                .normalizeEmail()
                .withMessage('Invalid email address'),
                body('password')
                .trim()
                .notEmpty()
                .withMessage('Password field required')
                .isLength({ min: 6 })
                .withMessage('Password must be at least 6 characters long'),
                body('confirmPassword')
                .trim()
                .notEmpty()
                .withMessage('Confirmation password required')
                .isLength({ min: 6 })
                .withMessage('Password must be at least 6 characters long')
        ], async (req, res, next) => {
                try {
                        const errors = validationResult(req);
                        if(!errors.isEmpty()) {
                                const errMsg = errors.array()[0]?.msg;
                                req.flash('error', errMsg);
                                return res.redirect('/auth/signup');
                        }

                        const { name, email, password, confirmPassword } = req.body;
                        if(!name || !email || !password || !confirmPassword) {
                                req.flash('error', 'Missing Credentials');
                                return res.redirect('/auth/signup');
                        }
                        const emailLower = email.toLowerCase();
                        const user = await User.findOne({ email: emailLower });
                        if(user) {
                                req.flash('error', 'Email already registered');
                                return res.redirect('/auth/signup');
                        }
                        const hash = await bcrypt.hash(password, 10);
                        const verificationToken = crypto.randomBytes(32).toString('hex');
                        const verificationDate = Date.now() + 24 * 60 * 60 * 1000; // 1day

                        const newUser = new User({
                                name,
                                email: email.toLowerCase(),
                                password: hash,
                                verificationToken,
                                verificationDate,
                                isVerified: false
                        });
                        await newUser.save();
                        await sendVerificationEmail(email, verificationToken);
                        res.status(201).send('<h2> Verification email sent, Check your email.</h2>');
                } catch(err) {
                        next(err);
                }
        });

        router.get('/auth/login', (req, res, next) => {
                try {
                        res.render('login');
                } catch(err) {
                        next(err);
                }
        });

        router.post('/auth/login', [
                body('email')
                .trim()
                .escape()
                .notEmpty()
                .withMessage('Email field required')
                .isEmail()
                .normalizeEmail()
                .withMessage('Invalid email address'),
                body('password')
                .trim()
                .notEmpty()
                .withMessage('Password field required')

        ], passport.authenticate('local', {
                failureRedirect: '/auth/login',
                failureFlash: true,
                successFlash: true
        }), (req, res, next) => {
                try {
                        const errors = validationResult(req);
                        if(!errors.isEmpty()) {
                                const errMsg = errors.array()[0]?.msg;
                                req.flash('error', errMsg);
                                return res.redirect('/auth/login');
                        }
                        res.redirect('/');
                } catch(err) {
                        next(err);
                }
        });

        router.get('/auth/google', passport.authenticate('google', { scope: [ 'profile', 'email' ] } ));

        router.get('/auth/google/callback', passport.authenticate('google', {
                failureRedirect: '/auth/login',
                successRedirect: '/'
        }));

        router.get('/auth/facebook', passport.authenticate('facebook', { scope: [ 'profile', 'email' ] } ));

        router.get('/auth/facebook/callback', passport.authenticate('facebook', {
                failureRedirect: '/auth/login',
                successRedirect: '/'
        }));
        return router;
};
