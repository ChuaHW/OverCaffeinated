const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
  connectTimeout: 10000,
});

conn.connect((err) => {
  if (err) {
    console.error('Keepalive connection failed:', err.code, err.message);
    process.exit(1);
  }
  conn.query('SELECT 1', (err) => {
    conn.end();
    if (err) {
      console.error('Keepalive query failed:', err.message);
      process.exit(1);
    }
    console.log('Keepalive ping succeeded');
  });
});
