const express = require('express');
const router = express.Router();
const db = require('./db');
const jwt = require('jsonwebtoken');
const upload = require('./upload');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, email, display_name, bio, preferred_drink, avatar_url, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/profile', authMiddleware, upload.single('avatar'), async (req, res) => {
  const { display_name, bio, preferred_drink } = req.body;
  try {
    if (req.file) {
      const avatar_url = `http://localhost:3001/uploads/${req.file.filename}`;
      await db.query(
        'UPDATE users SET display_name = ?, bio = ?, preferred_drink = ?, avatar_url = ? WHERE id = ?',
        [display_name, bio, preferred_drink, avatar_url, req.user.id]
      );
    } else {
      await db.query(
        'UPDATE users SET display_name = ?, bio = ?, preferred_drink = ? WHERE id = ?',
        [display_name, bio, preferred_drink, req.user.id]
      );
    }
    res.json({ message: 'Profile updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;