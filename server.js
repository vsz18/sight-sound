const express = require('express');
const { Pool } = require('pg');
const path = require('path');

const app  = express();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname)));

// Create table on startup
pool.query(`
  CREATE TABLE IF NOT EXISTS state (
    id   TEXT PRIMARY KEY DEFAULT 'main',
    data JSONB NOT NULL DEFAULT '{}'
  )
`).catch(console.error);

app.get('/api/state', async (req, res) => {
  try {
    const result = await pool.query("SELECT data FROM state WHERE id = 'main'");
    res.json(result.rows[0]?.data || {});
  } catch(e) {
    res.status(500).json({});
  }
});

app.post('/api/state', async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO state (id, data) VALUES ('main', $1)
       ON CONFLICT (id) DO UPDATE SET data = $1`,
      [req.body]
    );
    res.json({ ok: true });
  } catch(e) {
    res.status(500).json({ ok: false });
  }
});

// Serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Running on port ${PORT}`));
