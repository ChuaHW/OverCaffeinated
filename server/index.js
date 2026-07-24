const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const authRoutes = require('./auth');
const cafeRoutes = require('./cafes');
const forgotPasswordRoutes = require('./forgotPassword');
const usersRoutes = require('./users');
const reviewRoutes = require('./reviews'); 
const shelfRoutes = require('./shelf');
const exportRoutes = require('./export');

app.use('/api/auth', authRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api', forgotPasswordRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reviews', reviewRoutes); 
app.use('/api/shelf', shelfRoutes);
app.use('/api/export', exportRoutes);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    return res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'Photo must be under 5MB' : err.message });
  }
  if (err && err.message === 'Only image files are allowed') {
    return res.status(400).json({ error: err.message });
  }
  if (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong' });
  }
  next();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));