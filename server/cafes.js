const express = require('express');
const router = express.Router();
const db = require('./db');
const jwt = require('jsonwebtoken');
const upload = require('./upload');

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

function requireOwner(req, res, next) {
  if (req.user.role !== 'owner') {
    return res.status(403).json({ error: 'Only cafe owners can do this' });
  }
  next();
}

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cafes.*,
              ROUND(AVG(reviews.rating), 1) AS avg_rating,
              COUNT(reviews.id) AS review_count
       FROM cafes
       LEFT JOIN reviews ON reviews.cafe_id = cafes.id
       GROUP BY cafes.id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve cafes' });
  }
});

router.get('/mine', authMiddleware, requireOwner, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT cafes.*,
              ROUND(AVG(reviews.rating), 1) AS avg_rating,
              COUNT(reviews.id) AS review_count
       FROM cafes
       LEFT JOIN reviews ON reviews.cafe_id = cafes.id
       WHERE cafes.owner_id = ?
       GROUP BY cafes.id
       ORDER BY cafes.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not retrieve your cafes' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cafes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cafe not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve cafe' });
  }
});

router.post('/', authMiddleware, requireOwner, upload.single('photo'), async (req, res) => {
  const { name, address, description, specialty, opening_time, closing_time } = req.body;
  if (!name) return res.status(400).json({ error: 'Cafe name is required' });
  const image_url = req.file ? req.file.path : null;
  try {
    const [result] = await db.query(
      `INSERT INTO cafes (name, address, description, specialty, image_url, opening_time, closing_time, owner_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, address || null, description || null, specialty || null, image_url, opening_time || null, closing_time || null, req.user.id]
    );
    res.json({ message: 'Cafe listing created', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create cafe listing' });
  }
});

router.put('/:id', authMiddleware, requireOwner, upload.single('photo'), async (req, res) => {
  const { name, address, description, specialty, opening_time, closing_time } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM cafes WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Cafe not found' });
    if (existing[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only edit your own cafe listings' });
    }
    const image_url = req.file ? req.file.path : existing[0].image_url;
    await db.query(
      `UPDATE cafes SET name = ?, address = ?, description = ?, specialty = ?, image_url = ?, opening_time = ?, closing_time = ?
       WHERE id = ?`,
      [name, address || null, description || null, specialty || null, image_url, opening_time || null, closing_time || null, req.params.id]
    );
    res.json({ message: 'Cafe listing updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update cafe listing' });
  }
});

router.delete('/:id', authMiddleware, requireOwner, async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM cafes WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Cafe not found' });
    if (existing[0].owner_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own cafe listings' });
    }
    await db.query('DELETE FROM cafes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cafe listing deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete cafe listing' });
  }
});

module.exports = router;