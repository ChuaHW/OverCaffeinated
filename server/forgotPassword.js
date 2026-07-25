const express = require('express');
const router = express.Router();
const db = require('./db');
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
require('dotenv').config();

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    await db.query(
      'INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expiresAt]
    );

    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    await sgMail.send({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'OverCaffeinated - Password Reset Request',
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset for your OverCaffeinated account.</p>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}">Reset Password</a>
        <p>If you did not request this, ignore this email.</p>
      `,
    });

    res.json({ message: 'Password reset email sent' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

router.post('/reset-password', async (req, res) => {
  const { token, password } = req.body;
  try {
    const [rows] = await db.query(
      'SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > NOW()',
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Invalid or expired reset link' });
    }

    const bcrypt = require('bcryptjs');
    const hash = await bcrypt.hash(password, 10);

    await db.query('UPDATE users SET password_hash = ? WHERE email = ?', [hash, rows[0].email]);
    await db.query('DELETE FROM password_reset_tokens WHERE token = ?', [token]);

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});

module.exports = router;