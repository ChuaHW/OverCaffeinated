# OverCaffeinated

A community-driven web platform for cafe enthusiasts to discover and review specialty cafes in Singapore.

## Features
- Cafe directory displaying a curated list of specialty cafes in Singapore
- User authentication — create an account, log in, and log out
- Forgot password — request a password reset link via email
- Reset password — securely reset your password via a tokenised link
- Reviews and ratings — leave a star rating and written review for any cafe, with average ratings displayed per cafe
- Coffee Shelf — save cafes to a personal shelf organised by status: Want to Visit, Currently Exploring, and All-Time Favourites
- Search and filtering — search cafes by name and filter by highest rating, most reviews and brew methods
- User profiles — view your bio, preferred drink, submitted reviews, and Coffee Shelf in one place
- Edit profile — update your display name, bio, preferred drink, and profile photo
- Cafe Owner Dashboard — register as a cafe owner to list, edit, and delete your own cafe listings, including photo uploads
- Data Export — download a PDF report of your Coffee Shelf and review history from your profile page
- Social Sharing — share a cafe with friends via WhatsApp or Telegram, complete with its name, rating, and a direct link back to it on OverCaffeinated

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js with Express
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** SendGrid
- **Image Storage:** Cloudinary

## How to Run Locally

### Prerequisites
- Node.js
- MySQL

### Database Setup
1. Start MySQL server
2. Open MySQL: `mysql -u root -p`
3. Run the schema file: `source path/to/server/schema.sql`

### Backend
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file with the following:
```
PORT=3001
CLIENT_URL=http://localhost:3000

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=overcaffeinated
DB_SSL=false

JWT_SECRET=your_jwt_secret

SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```
4. Start the server: `node index.js`

### Frontend
1. Navigate to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Start the app: `npm start`
4. Open your browser and go to `http://localhost:3000`

## Forgot Password
1. Click "Reset it here" on the login page
2. Enter your registered email address
3. Click "Send Reset Link"
4. Check your email inbox for the reset email
5. Click the reset link in the email
6. Enter your new password and click "Reset Password"
7. You will be redirected to the login page

### Notes
- Reset links expire after 1 hour
- Emails are sent via SendGrid — you'll need a SendGrid API key and a verified sender email set as `EMAIL_FROM`
