import nodemailer from "nodemailer";

// Ensure process is defined (for environments like some bundlers or test runners)
import process from "process";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const baseEmailTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background-color: #ffffff;
      border-radius: 8px;
      padding: 30px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 150px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #4F46E5;
      color: #ffffff;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    ${content}
    <div class="footer">
      <p>This is an automated message, please do not reply to this email.</p>
      <p>&copy; ${new Date().getFullYear()} Aqarlee. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

export const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: `"AI Driven" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;
  const content = `
    <div class="header">
      <h1>Welcome to AI Driven!</h1>
    </div>
    <p>Thank you for signing up. To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
    <div style="text-align: center;">
      <a href="${verificationUrl}" class="button">Verify Email Address</a>
    </div>
    <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
    <p style="word-break: break-all;">${verificationUrl}</p>
    <p>This verification link will expire in 24 hours.</p>
    <p>If you didn't create an account with AI Driven, you can safely ignore this email.</p>
  `;

  return await sendEmail(email, "Verify Your Email - AI Driven", baseEmailTemplate(content));
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const content = `
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <p>We received a request to reset your password. Click the button below to create a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    <p>If the button above doesn't work, you can also copy and paste this link into your browser:</p>
    <p style="word-break: break-all;">${resetUrl}</p>
    <p>This password reset link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
  `;

  return await sendEmail(email, "Reset Your Password - Aqarlee", baseEmailTemplate(content));
};

export const send2FAEmail = async (email, code) => {
  const content = `
    <div class="header">
      <h1>Your 2FA Code</h1>
    </div>
    <p>Use the following code to complete your sign-in:</p>
    <div style="text-align: center; margin: 20px 0;">
      <div style="display: inline-block; font-size: 24px; font-weight: bold; background: #f3f4f6; padding: 12px 24px; border-radius: 6px;">
        ${code}
      </div>
    </div>
    <p>This code is valid for the next 10 minutes. Please do not share it with anyone.</p>
    <p>If you didn’t request this code, you can safely ignore this email.</p>
  `;

  return await sendEmail(email, "Your 2FA Code - Aqarlee", baseEmailTemplate(content));
};
