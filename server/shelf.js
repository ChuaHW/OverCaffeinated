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
  const { cafe_id, status } = req.body;
  if (!cafe_id || !status) {
    return res.status(400).json({ error: 'cafe_id and status are required' });
  }
  try {
    await db.query(
      `INSERT INTO coffee_shelf (user_id, cafe_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [req.user.id, cafe_id, status]
    );
    res.json({ message: 'Shelf updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update shelf' });
  }
});

router.get('/mine', authMiddleware, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT coffee_shelf.id, coffee_shelf.status,
              cafes.id AS cafe_id, cafes.name AS cafe_name, cafes.address
       FROM coffee_shelf
       JOIN cafes ON coffee_shelf.cafe_id = cafes.id
       WHERE coffee_shelf.user_id = ?
       ORDER BY coffee_shelf.status, cafes.name`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch shelf' });
  }
});

router.delete('/:cafeId', authMiddleware, async (req, res) => {
  const { cafeId } = req.params;
  try {
    await db.query(
      'DELETE FROM coffee_shelf WHERE user_id = ? AND cafe_id = ?',
      [req.user.id, cafeId]
    );
    res.json({ message: 'Removed from shelf' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove from shelf' });
  }
});

module.exports = router;