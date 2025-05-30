// server.js
import express from 'express';
import { randomUUID } from 'crypto';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Пул з’єднань до MySQL
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


// — Users —

// GET /api/users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, username, email, created_at FROM users'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /api/users error:', err);
    res.status(500).json({ error: 'Cannot fetch users' });
  }
});

// POST /api/users
app.post('/api/users', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const [exist] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (exist.length) {
      return res.status(400).json({ error: 'Email already used' });
    }
    const id = randomUUID();
    await pool.query(
      'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
      [id, username, email, password]
    );
    res.json({ id, username, email });
  } catch (err) {
    console.error('POST /api/users error:', err);
    res.status(500).json({ error: 'Cannot create user' });
  }
});


// — Posts —

// GET /api/posts?view=all|user&user_id=…
app.get('/api/posts', async (req, res) => {
  const view   = req.query.view   || 'all';
  const userId = req.query.user_id;
  let rows;
  try {
    if (view === 'user' && userId) {
      const [r] = await pool.query(
        `SELECT p.id, p.title, p.body, p.image_url, p.created_at, u.username
         FROM posts p
         JOIN users u ON p.user_id = u.id
         WHERE p.user_id = ?
         ORDER BY p.created_at DESC`,
        [userId]
      );
      rows = r;
    } else {
      const [r] = await pool.query(
        `SELECT p.id, p.title, p.body, p.image_url, p.created_at, u.username
         FROM posts p
         JOIN users u ON p.user_id = u.id
         ORDER BY p.created_at DESC`
      );
      rows = r;
    }

    // Порахувати up/down та кількість коментарів
    for (let post of rows) {
      const [[votes]] = await pool.query(
        `SELECT
           (SELECT COUNT(*) FROM votes WHERE post_id = ? AND vote =  1) AS up,
           (SELECT COUNT(*) FROM votes WHERE post_id = ? AND vote = -1) AS down`,
        [post.id, post.id]
      );
      post.vote_diff = votes.up - votes.down;

      const [[{ cnt }]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM comments WHERE post_id = ?`,
        [post.id]
      );
      post.comment_count = cnt;
    }

    res.json(rows);
  } catch (err) {
    console.error('GET /api/posts error:', err);
    res.status(500).json({ error: 'Cannot fetch posts' });
  }
});

// POST /api/posts
app.post('/api/posts', async (req, res) => {
  const { user_id, title, body, image_url } = req.body;
  if (!user_id || !title) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const id = randomUUID();
    await pool.query(
      'INSERT INTO posts (id, user_id, title, body, image_url) VALUES (?, ?, ?, ?, ?)',
      [id, user_id, title, body || null, image_url || null]
    );
    const [[post]] = await pool.query(
      `SELECT p.id, p.title, p.body, p.image_url, p.created_at, u.username
       FROM posts p
       JOIN users u ON p.user_id = u.id
       WHERE p.id = ?`,
      [id]
    );
    post.vote_diff     = 0;
    post.comment_count = 0;
    res.json(post);
  } catch (err) {
    console.error('POST /api/posts error:', err);
    res.status(500).json({ error: 'Cannot create post' });
  }
});

// POST /api/posts/:id/vote — toggle-голос за пост
app.post('/api/posts/:id/vote', async (req, res) => {
  const postId   = req.params.id;
  const { user_id, vote } = req.body;
  if (!user_id || ![1, -1].includes(vote)) {
    return res.status(400).json({ error: 'Missing or invalid vote data' });
  }

  try {
    // 1) Перевірити наявність попереднього голосу
    const [existing] = await pool.query(
      'SELECT vote FROM votes WHERE post_id = ? AND user_id = ?',
      [postId, user_id]
    );

    if (existing.length === 0) {
      // Вставити новий голос
      await pool.query(
        'INSERT INTO votes (post_id, user_id, vote) VALUES (?, ?, ?)',
        [postId, user_id, vote]
      );
    } else if (existing[0].vote === vote) {
      // toggle-off: видалити свій голос
      await pool.query(
        'DELETE FROM votes WHERE post_id = ? AND user_id = ?',
        [postId, user_id]
      );
    } else {
      // Змінити голос
      await pool.query(
        'UPDATE votes SET vote = ? WHERE post_id = ? AND user_id = ?',
        [vote, postId, user_id]
      );
    }

    // 2) Порахувати нову різницю up/down
    const [[counts]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM votes WHERE post_id = ? AND vote =  1) AS up,
         (SELECT COUNT(*) FROM votes WHERE post_id = ? AND vote = -1) AS down`,
      [postId, postId]
    );
    const diff = counts.up - counts.down;

    res.json({ success: true, vote_diff: diff });
  } catch (err) {
    console.error('POST /api/posts/:id/vote error:', err);
    res.status(500).json({ error: 'Cannot record post vote' });
  }
});


// — Comments —

// GET /api/comments?post_id=…
app.get('/api/comments', async (req, res) => {
  const postId = req.query.post_id;
  if (!postId) {
    return res.status(400).json({ error: 'Missing post_id' });
  }
  try {
    const [comments] = await pool.query(
      `SELECT c.id, c.post_id, c.parent_id, c.user_id, c.body, c.created_at, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [postId]
    );

    // Додати up/down для коментарів
    for (let c of comments) {
      const [[votes]] = await pool.query(
        `SELECT
           (SELECT COUNT(*) FROM comments_votes WHERE comment_id = ? AND vote =  1) AS up,
           (SELECT COUNT(*) FROM comments_votes WHERE comment_id = ? AND vote = -1) AS down`,
        [c.id, c.id]
      );
      c.upvotes   = votes.up;
      c.downvotes = votes.down;
    }

    res.json(comments);
  } catch (err) {
    console.error('GET /api/comments error:', err);
    res.status(500).json({ error: 'Cannot fetch comments' });
  }
});

// POST /api/comments
app.post('/api/comments', async (req, res) => {
  const { post_id, parent_id, user_id, body } = req.body;
  if (!post_id || !user_id || !body) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  try {
    const id = randomUUID();
    await pool.query(
      'INSERT INTO comments (id, post_id, parent_id, user_id, body) VALUES (?, ?, ?, ?, ?)',
      [id, post_id, parent_id || null, user_id, body]
    );
    const [[comment]] = await pool.query(
      `SELECT c.id, c.post_id, c.parent_id, c.user_id, c.body, c.created_at, u.username
       FROM comments c
       JOIN users u ON c.user_id = u.id
       WHERE c.id = ?`,
      [id]
    );
    comment.upvotes   = 0;
    comment.downvotes = 0;
    res.json(comment);
  } catch (err) {
    console.error('POST /api/comments error:', err);
    res.status(500).json({ error: 'Cannot create comment' });
  }
});

// POST /api/comments/:id/vote
app.post('/api/comments/:id/vote', async (req, res) => {
  const commentId = req.params.id;
  const { user_id, vote } = req.body;
  if (!user_id || ![1, -1].includes(vote)) {
    return res.status(400).json({ error: 'Missing or invalid vote data' });
  }
  try {
    const [existing] = await pool.query(
      'SELECT vote FROM comments_votes WHERE comment_id = ? AND user_id = ?',
      [commentId, user_id]
    );

    if (existing.length === 0) {
      await pool.query(
        'INSERT INTO comments_votes (comment_id, user_id, vote) VALUES (?, ?, ?)',
        [commentId, user_id, vote]
      );
    } else if (existing[0].vote === vote) {
      await pool.query(
        'DELETE FROM comments_votes WHERE comment_id = ? AND user_id = ?',
        [commentId, user_id]
      );
    } else {
      await pool.query(
        'UPDATE comments_votes SET vote = ? WHERE comment_id = ? AND user_id = ?',
        [vote, commentId, user_id]
      );
    }

    const [[counts]] = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM comments_votes WHERE comment_id = ? AND vote =  1) AS up,
         (SELECT COUNT(*) FROM comments_votes WHERE comment_id = ? AND vote = -1) AS down`,
      [commentId, commentId]
    );
    const diff = counts.up - counts.down;

    res.json({ success: true, vote_diff: diff });
  } catch (err) {
    console.error('POST /api/comments/:id/vote error:', err);
    res.status(500).json({ error: 'Cannot record comment vote' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
