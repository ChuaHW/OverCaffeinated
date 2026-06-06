CREATE DATABASE IF NOT EXISTS overcaffeinated;
USE overcaffeinated;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  username VARCHAR(255) DEFAULT NULL,
  display_name VARCHAR(100) DEFAULT NULL,
  role ENUM('user', 'owner') NOT NULL DEFAULT 'user',
  bio TEXT DEFAULT NULL,
  preferred_drink VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cafes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  address VARCHAR(500),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cafes (name, address, description) VALUES
('Nylon Coffee Roasters', '1 Everton Park', 'Specialty roaster in Tanjong Pagar'),
('Percolate', '136 Bedok North Ave 3', 'Specialty cafe in Bedok'),
('Common Man Coffee', '22 Martin Rd', 'Specialty coffee with great brunch');