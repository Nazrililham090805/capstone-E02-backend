import pool from '../config/db.js';
import bcrypt from 'bcrypt';

export async function createAdmin(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO admin (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, hashedPassword]
  );
  return result.rows[0];
}

export async function getAdminByUsername(username) {
  const result = await pool.query('SELECT * FROM admin WHERE username = $1', [username]);
  return result.rows[0];
}

export async function updateAdmin(id, username, password) {
  const fields = [];
  const values = [];
  let index = 1;

  if (username) {
    fields.push(`username = $${index++}`);
    values.push(username);
  }
  if (password) {
    const hashed = await bcrypt.hash(password, 10);
    fields.push(`password = $${index++}`);
    values.push(hashed);
  }

  if (fields.length === 0) throw new Error('No fields to update');

  values.push(id);
  const query = `UPDATE admin SET ${fields.join(', ')} WHERE id = $${index} RETURNING id, username`;
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function deleteAdmin(id) {
  const result = await pool.query('DELETE FROM admin WHERE id = $1 RETURNING id', [id]);
  return result.rows[0];
}
