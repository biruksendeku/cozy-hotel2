const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendVerificationEmail(email, token) {
  const verificationUrl = `${process.env.BASE_URL}/api/verify/email/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify Your Email",
    html: `
      <h1>Verify Your Email</h1>
      <p>Click the link below to verify your email.</p>
      <a href="${verificationUrl}">Verify Here</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

async function resetApprovalEmail(email, token) {
  const resetUrl = `${process.env.BASE_URL}/api/request/reset/approve/password/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Approve Password Reset",
    html: `
      <h1>Approve Password Reset</h1>
      <p>Click the link below to approve the password reset.</p>
      <a href="${resetUrl}">Approve Reset</a>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

async function resetSuccessfulEmail(email) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Password Reset Successful",
    html: `
      <h1>Password Reset Approved</h1>
      <p>Your password has been updated. You can now log in with your new password.</p>
    `,
  });
}

module.exports = {
  sendVerificationEmail,
  resetApprovalEmail,
  resetSuccessfulEmail,
};
