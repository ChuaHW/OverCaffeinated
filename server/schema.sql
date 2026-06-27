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
  tags VARCHAR(500) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cafe_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
  UNIQUE KEY one_review_per_user_per_cafe (user_id, cafe_id)
);

CREATE TABLE IF NOT EXISTS coffee_shelf (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  cafe_id INT NOT NULL,
  status ENUM('want_to_visit', 'currently_exploring', 'all_time_favorites') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
  UNIQUE KEY one_shelf_entry_per_user_per_cafe (user_id, cafe_id)
);

INSERT INTO cafes (name, address, description, tags) VALUES
('Nylon Coffee Roasters', '1 Everton Park', 'Specialty roaster in Tanjong Pagar', 'Pour-over'),
('Percolate', '136 Bedok North Ave 3', 'Specialty cafe in Bedok', 'Espresso'),
('Common Man Coffee', '22 Martin Rd', 'Specialty coffee with great brunch', 'Espresso'),
('20Grams Coffee Roastery', '14 Arumugam Road, #01-05 LTC Building C, Singapore 409959', 'Nordic-style specialty roastery near MacPherson, known for light, fruit-forward single-origin roasts', 'Pour-over'),
('Alchemist (Khong Guan Building)', '2 MacTaggart Road, #01-01 Khong Guan Building, Singapore 368078', 'Flagship store and in-house roastery in a heritage former biscuit factory in Tai Seng', 'Pour-over'),
('Alchemist (The Mill)', '5 Jln Kilang, #02-02 The Mill, Singapore 159405', 'Dine-in outlet at The Mill, Jalan Kilang', 'Pour-over'),
('Alchemist (The Heeren)', '260 Orchard Rd, #01-ORA The Heeren, Singapore 238855', 'Orchard Road outlet with seating and pastries', 'Pour-over');