import express from 'express';
import compostRouter from './routes/compost_routes.js';
import adminRouter from './routes/admin_routes.js';
import pool from './config/db.js';

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/compost', compostRouter);
app.use('/admin', adminRouter);

// Root route
app.get('/', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ message: '✅ Connected to PostgreSQL', time: result.rows[0].now });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database connection failed', detail: err.message });
  }
});

export default app;
