// server.js
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

const app = express();
const PORT = process.env.PORT || 3000;
const USERS_FILE = path.resolve('./users.json');

// Дозвіл читати JSON + статичні файли фронтенда
app.use(express.json());
app.use(express.static('src'));

// Отримати всіх користувачів
app.get('/api/users', async (req, res) => {
  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    res.json(JSON.parse(raw));
  } catch {
    res.status(500).json({ error: 'Cannot read users.json' });
  }
});

// Зареєструвати нового користувача
app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  try {
    const raw = await fs.readFile(USERS_FILE, 'utf8');
    const users = JSON.parse(raw);

    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Email already used' });
    }

    const newUser = {
      id: randomUUID(),
      username,
      email,
      password
    };
    users.push(newUser);
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

    res.json(newUser);
  } catch {
    res.status(500).json({ error: 'Cannot write users.json' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});