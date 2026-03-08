const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASS, BASE_URL } = process.env;

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

module.exports = async function sendVerificationEmail(email, token) {
  const verificationUrl = `${BASE_URL}/api/request/verify/email/${token}`;
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Verifi Your Email",
    html: `
		<h1> Verify Your Email </h1>
		<p> Click on the link below to verify email </p>
		<a  href="${verificationUrl}"> Verify Here </a>
		<p> This link expires in 24 hours. </p>
		`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = async function resetApprovalEmail(email, token) {
  const resetUrl = `${BASE_URL}/api/request/reset/verify/password/${token}`;
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Approve Password Reset",
    html: `
		<h1> Approve Password Reset </g1>
		<p> Click on the link below to reset old password </p>
		<a href="${resetUrl}"> Approve Reset </a>
		<p> This link expires in 24 hours. </p>
		`,
  };
  await transporter.sendMail(mailOptions);
};

module.exports = async function resetSuccessfulEmail(email) {
  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Successfully Reset Old Password",
    html: `
		<h1> Password Reset Apprroved </h1>
		<p> New password created. Now you can Login with the new password.</p>
		`,
  };
  await transporter.sendMail(mailOptions);
};
