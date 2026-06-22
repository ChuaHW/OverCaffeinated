const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const authRoutes = require('./auth');
const cafeRoutes = require('./cafes');
const forgotPasswordRoutes = require('./forgotPassword');
const usersRoutes = require('./users');
const reviewRoutes = require('./reviews'); 
const shelfRoutes = require('./shelf');

app.use('/api/auth', authRoutes);
app.use('/api/cafes', cafeRoutes);
app.use('/api', forgotPasswordRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/reviews', reviewRoutes); 
app.use('/api/shelf', shelfRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));