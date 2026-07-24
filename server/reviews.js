const express = require('express');
const router = express.Router();
const db = require('./db');
const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorised' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/', authMiddleware, async (req, res) => {
  const { cafe_id, rating, review_text } = req.body;
  if (!cafe_id || !rating) {
    return res.status(400).json({ error: 'cafe_id and rating are required' });
  }
  try {
    await db.query(
      'INSERT INTO reviews (user_id, cafe_id, rating, review_text) VALUES (?, ?, ?, ?)',
      [req.user.id, cafe_id, rating, review_text || '']
    );
    res.json({ message: 'Review submitted' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'You have already reviewed this cafe' });
    }
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user/mine', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT reviews.id, reviews.rating, reviews.review_text, reviews.created_at,
              cafes.id AS cafe_id, cafes.name AS cafe_name
       FROM reviews
       JOIN cafes ON reviews.cafe_id = cafes.id
       WHERE reviews.user_id = ?
       ORDER BY reviews.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch your reviews' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id FROM reviews WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Review not found' });
    if (rows[0].user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own reviews' });
    }
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete review' });
  }
});

router.get('/:cafeId', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT reviews.id, reviews.rating, reviews.review_text, reviews.created_at,
              users.display_name, users.username, users.avatar_url
       FROM reviews
       JOIN users ON reviews.user_id = users.id
       WHERE reviews.cafe_id = ?
       ORDER BY reviews.created_at DESC`,
      [req.params.cafeId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch reviews' });
  }
});

module.exports = router;