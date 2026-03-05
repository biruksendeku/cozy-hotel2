require('dotenv').config();

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
	service: 'Gmail',
	
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS
	}
});

module.exports = async function sendVerificationEmail(email, token) {
	const verificationUrl = `${process.env.BASE_URL}/api/request/verify/email/${token}`;
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Verifi Your Email',
		html: `
		<h1> Verify Your Email </h1>
		<p> Click on the link below to verify email </p>
		<a  href="${verificationUrl}"> Verify Here </a>
		<p> This link expires in 24 hours. </p>
		`
	};
	await transporter.sendMail(mailOptions);
};

module.exports = async function resetApprovalEmail(email, token) {
	const resetUrl = `${process.env.BASE_URL}/api/request/reset/verify/password/${token}`;;
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Approve Password Reset',
		html: `
		<h1> Approve Password Reset </g1>
		<p> Click on the link below to reset old password </p>
		<a href="${resetUrl}"> Approve Reset </a>
		<p> This link expires in 24 hours. </p>
		`
	};
	await transporter.sendMail(mailOptions);
};

module.exports = async function resetSuccessfulEmail(email) {
	const mailOptions = {
		from: process.env.EMAIL_USER,
		to: email,
		subject: 'Successfully Reset Old Password',
		html: `
		<h1> Password Reset Apprroved </h1>
		<p> New password created. Now you can Login with the new password.</p>
		`
	};
	await transporter.sendMail(mailOptions);
};
