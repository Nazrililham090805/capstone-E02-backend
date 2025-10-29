import app from './app.js';
import dotenv from 'dotenv';
import pool from './config/db.js';
dotenv.config();

async function warmupDbClients(count = parseInt(process.env.PG_WARMUP_CLIENTS, 10) || 1) {
  try {
    const clients = [];
    for (let i = 0; i < count; i++) {
      const client = await pool.connect();
      clients.push(client);
    }
    await Promise.all(clients.map(c => c.query('SELECT 1')));
    clients.forEach(c => c.release());
    console.log(`✅ DB pool warmed with ${count} connection(s)`);
  } catch (err) {
    console.warn('DB warmup failed:', err.message);
  }
}

const PORT = process.env.PORT || 3000;
(async () => {
  // start server immediately so frontend tidak nunggu warmup
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

  warmupDbClients();
})();