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
  specialty VARCHAR(255) DEFAULT NULL,
  tags VARCHAR(500) DEFAULT NULL,
  image_url VARCHAR(500) DEFAULT NULL,
  owner_id INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
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
  status ENUM('want_to_visit', 'currently_exploring', 'all_time_favourites') NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (cafe_id) REFERENCES cafes(id) ON DELETE CASCADE,
  UNIQUE KEY one_shelf_entry_per_user_per_cafe (user_id, cafe_id)
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(64) NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO cafes (name, address, description, specialty, tags) VALUES
('Nylon Coffee Roasters', '1 Everton Park', 'A pioneering micro-roastery and coffee bar in Everton Park, sourcing single-origin beans directly from small farms and roasting them in-house since 2012.', 'Single-origin pour-over', 'Pour-over'),
('Percolate', '136 Bedok North Ave 3', 'A cosy multi-roaster specialty cafe in the heart of Bedok since 2014, pairing curated coffees from local and international roasters with pastries and cakes.', 'Multi-roaster espresso', 'Espresso'),
('Common Man Coffee', '22 Martin Rd', 'Singapore''s original specialty coffee roastery, this plant-filled Martin Road flagship pairs expertly roasted espresso with an all-day brunch menu in a laidback Robertson Quay setting.', 'Espresso & all-day brunch', 'Espresso'),
('20Grams Coffee Roastery', '14 Arumugam Road, #01-05 LTC Building C, Singapore 409959', 'A Nordic-style roastery near MacPherson roasting rare, sustainably sourced beans for clarity and sweetness, with rotating single-origin offerings like Pink Bourbon and Panama Geisha.', 'Nordic-style light roasts', 'Pour-over'),
('Alchemist (Khong Guan Building)', '2 MacTaggart Road, #01-01 Khong Guan Building, Singapore 368078', 'Flagship store and in-house roastery in a heritage former biscuit factory in Tai Seng, decked out in a minimalist marble-and-blue interior.', 'In-house roasted, simplified menu', 'Pour-over'),
('Alchemist (The Mill)', '5 Jln Kilang, #02-02 The Mill, Singapore 159405', 'Dine-in outlet at The Mill, Jalan Kilang, serving the brand''s approachable bright, balanced or bold coffee profiles alongside pastries.', 'Bright, balanced or bold blends', 'Pour-over'),
('Alchemist (The Heeren)', '260 Orchard Rd, #01-ORA The Heeren, Singapore 238855', 'Orchard Road outlet with seating and pastries, bringing the brand''s approachable specialty coffee to the shopping belt.', 'Approachable specialty coffee', 'Pour-over');