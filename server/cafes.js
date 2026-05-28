const express = require('express');
const router = express.Router();
const db = require('./db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM cafes');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Could not retrieve cafes' });
  }
});

module.exports = router;