# OverCaffeinated

A community-driven web platform for cafe enthusiasts to discover and review specialty cafes in Singapore.

## Features
- Cafe directory displaying a list of cafes retrieved from the backend database
- User authentication — create an account, log in, and log out
- Forgot password — request a password reset link via email
- Reset password — securely reset your password via a tokenised link

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js with Express
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Email Testing:** Mailtrap

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
    DB_HOST=127.0.0.1
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=overcaffeinated
    JWT_SECRET=your_jwt_secret
    MAILTRAP_HOST=sandbox.smtp.mailtrap.io
    MAILTRAP_PORT=2525
    MAILTRAP_USER=your_mailtrap_user
    MAILTRAP_PASS=your_mailtrap_password
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
4. Check your Mailtrap inbox for the reset email
5. Click the reset link in the email
6. Enter your new password and click "Reset Password"
7. You will be redirected to the login page

### Notes
- Reset links expire after 1 hour
- Email testing is handled via Mailtrap during development
- To view test emails, log into your Mailtrap inbox at mailtrap.io