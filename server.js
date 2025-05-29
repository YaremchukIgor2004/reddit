// server.js
import express from 'express';
import { randomUUID } from 'crypto';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Пул підключень до MySQL
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(express.json());
app.use(express.static('src'));

// GET /api/users — повернути всіх користувачів (без паролів)
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, created_at FROM users'
    );
    res.json(rows);
  } catch (err) {
    console.error('DB ERR:', err);
    res.status(500).json({ error: 'Cannot fetch users' });
  }
});

// POST /api/users — реєстрація нового користувача
app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    // Перевіряємо дубль email
    const [exist] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (exist.length) {
      return res.status(400).json({ error: 'Email already used' });
    }

    // Створюємо запис
    const id = randomUUID();
    await pool.query(
      `INSERT INTO users (id, username, email, password)
       VALUES (?, ?, ?, ?)`,
      [id, username, email, password]
    );

    // Віддаємо клієнту новоствореного юзера (без пароля)
    res.json({ id, username, email });
  } catch (err) {
    console.error('DB ERR:', err);
    res.status(500).json({ error: 'Cannot create user' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
