import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';
import compostRouter from './routes/compost_routes.js';
import adminRouter from './routes/admin_routes.js';
import pool from './config/db.js';

const app = express();

const allowedOrigins = [
  "https://capstone-e02-frontend-admin.vercel.app",
  
];

// Security, compression, logging BEFORE routes
app.use(helmet());
app.use(compression());
app.use(morgan('tiny'));
app.use(express.json({ limit: '100kb' }));

// simple timing middleware
app.use((req, res, next) => {
  const start = process.hrtime();
  res.once('finish', () => {
    const diff = process.hrtime(start);
    const ms = (diff[0] * 1e3) + (diff[1] / 1e6);
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} - ${ms.toFixed(2)}ms`);
  });
  next();
});

// CORS
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

// Health endpoint for keepalive/probes
app.get('/health', (req, res) => res.status(200).json({ ok: true, ts: new Date().toISOString() }));

// Routes
app.use('/compost', compostRouter);
app.use('/admin', adminRouter);

// Root route (kept)
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