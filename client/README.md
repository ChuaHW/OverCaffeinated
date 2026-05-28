# OverCaffeinated

A community-driven web platform for cafe enthusiasts to discover and review specialty cafes in Singapore.

## Features (Milestone 1)
- Basic cafe directory displaying a list of cafes retrieved from the backend database
- User authentication — create an account, log in, and log out

## Tech Stack
- **Frontend:** React.js
- **Backend:** Node.js with Express
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)

## How to Run Locally

### Prerequisites
- Node.js
- MySQL

### Database Setup
1. Open MySQL: `mysql -u root -p`
2. Run the schema file: `source path/to/server/schema.sql`

### Backend
1. Navigate to the server folder: `cd server`
2. Install dependencies: `npm install`
3. Create a `.env` file with your MySQL credentials
4. Start the server: `node index.js`

### Frontend
1. Navigate to the client folder: `cd client`
2. Install dependencies: `npm install`
3. Start the app: `npm start`
4. Open your browser and go to `http://localhost:3000`