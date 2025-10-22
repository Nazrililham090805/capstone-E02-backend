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
app.get('/', (req, res) => {
  res.json({ message: 'Backend running successfully!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Connected to PostgreSQL at:', result.rows[0].now);
    client.release();
  } catch (err) {
    console.error('❌ Database connection error:', err.message);
  }

  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
