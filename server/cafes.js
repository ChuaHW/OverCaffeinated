const express = require('express');
const router = express.Router();
const db = require('./db');

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

module.exports = router;