const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');

const User = require('../models/User');
const {
	sendVerificationEmail,
	resetApprovalEmail,
	resetSuccessfulEmail
} = require('../controllers/Email');

module.exports = function apiRoutes() {

        const router = require('express').Router();

        router.get('/api/verify/email/:token', async (req, res, next) => {
                try {
                        const token = req.params.token.toString();
                    const user = await User.findOne({
                        verificationToken: token,
                        verificationDate: { $gt: Date.now() },
                    });
                    if(!user) {
                        return res.render('resend');
                    }
                    if(user.isVerified) {
                        return res.status(400).send('User already verified.');
                    }
                    user.verificationToken = undefined;
                    user.verificationDate = undefined;
                    user.isVerified = true;
                    user.verifiedAt = new Date();
                    user.authProvider.push('local');
                    await user.save();
                    req.login(user, (err) => {
                                if(err) return next(err);
                                res.redirect('/');
                        });
                } catch(err) {
                        next(err);
                }
        });

        router.get('/api/resend/verification/link', (req, res, next) => {
                try {
                        res.render('resend');
                } catch(err) {
                        next(err);
                }
        });

        router.post('/api/resend/verification/link', [
        	body('email')
        	.notEmpty()
        	.withMessage('Email field required')
        	.isEmail()
        	.normalizeEmail()
        	.withMessage('Invalid email address')
        ], async (req, res, next) => {
                try {
                        const errors = validationResult(req);
                        if(!errors.isEmpty()) {
                                const errMsg = errors.array()[0]?.msg;
                                req.flash('error', errMsg);
                                return res.redirect('/api/resend/verification/link');
                        }
                        const { email } = req.body;
                        if(!email) {
                                req.flash('error', 'Email field required');
                                return res.redirect('/api/resend/verification/link');
                        }
                        const user = await User.findOne({ email });
                        if(!user) {
                                req.flash('error', 'Email not registered');
                                return res.redirect('/api/resend/verification/link');
                        }
                        if(user.isVerified) {
                                req.flash('error', 'Email already verified');
                                return res.redirect('/api/resend/verification/link');
                        }
                        const verificationToken = crypto.randomBytes(32).toString('hex');
                        const verificationDate = Date.now() + 24 * 60 * 60 * 1000; //1day

                        user.verificationToken = verificationToken;
                        user.verificationDate = verificationDate;
                        await user.save();
                        await sendVerificationEmail(email, verificationToken);
                        res.status(200).send('Verification email sent. Check your email to verify account');
                } catch(err) {
                        next(err);
                }
        });

        router.get('/api/request/reset/password', (req, res, next) => {
                try {
                        res.render('reset');
                } catch(err) {
                        next(err);
                }
        });

        router.post('/api/request/reset/approve/password', async (req, res, next) => {
                try {
                        const  { email, newPassword } = req.body;
                        if(!email) {
                                req.flash('error', 'Email field required');
                                return res.redirect('/api/reset/password');
                        }
                        const user = await User.findOne({ email });
                        if(!user) {
                                req.flash('error', 'Email not registered');
                                return res.redirect('/api/reset/password');
                        }
                        if(!user.isVerified) {
                                req.flash('error', 'Email must be verified, Signup first');
                                return res.redirect('/api/reset/password');
                        }
                        if(typeof user.password === null) {
                                req.flash('error', `Signup or use your last Auth Provider, ${lastUsedProvider}`);
                                return res.redirect('/api/reset/password');
                        }
                        const resetToken = crypto.randomBytes(32).toString('hex');
                        const resetDate = Date.now() + 24 * 60 * 60 * 1000; // 1day
                        const newHash = await bcrypt.hash(newPassword, 10);

                        user.resetToken = resetToken;
                        user.resetDate = resetDate;
                        user.newPassword = newHash;
                        await user.save();
                        await resetApprovalEmail(email, resetToken);
                        res.status(200).send('Reset approval link sent,check your email to approve');
                } catch(err) {
                        next(err);
                }
        });

        router.get('/api/request/reset/approve/password/:token', async (req, res, next) => {
                try {
                        const token = req.params.token.toString();
                        const user = await User.findOne({
                                resetToken: token,
                                resetDate: { $gt: Date.now() }
                        });
                        if(!user) {
                                return res.status(429).send('Email not registered, make sure u entered the correct email address');
                        }
                        if(!user.isVerified) {
                                return res.status(429).send('Unverified email, Signup and verify first');
                        }
                        const newPassword = user.newPassword;

                        user.password = newPassword;
                        user.newPassword = null;
                        await user.save();
                        await resetSuccessfulEmail(user.email);
                        res.redirect('/auth/login');
                } catch(err) {
                        next(err);
                }
        });
        return router;
};
