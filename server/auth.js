const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

router.post('/register', async (req, res) => {
  const { email, password, username } = req.body;
  console.log('Register attempt:', email, username);
  try {
    const hash = await bcrypt.hash(password, 10);
    await db.query(
      'INSERT INTO users (email, password_hash, username) VALUES (?, ?, ?)',
      [email, hash, username]
    );
    res.json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Register error:', err);
    if (err.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'An account with this email is already registered' });
    } else {
      res.status(500).json({ error: 'Something went wrong, please try again' });
    }
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });
    const passwordMatch = await bcrypt.compare(password, rows[0].password_hash);
    if (!passwordMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: rows[0].id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, username: rows[0].username });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;