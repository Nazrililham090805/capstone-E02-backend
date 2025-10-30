import pool from "../config/db.js";

export const getAllCompostRecords = async () => {
  const result = await pool.query(
    "SELECT * FROM compost ORDER BY tanggal DESC"
  );
  return result.rows;
};

export const getCompostRecordById = async (id) => {
  const result = await pool.query("SELECT * FROM compost WHERE id = $1", [id]);
  return result.rows[0];
};

export const getLatestCompost = async () => {
  const result = await pool.query(
    "SELECT * FROM compost ORDER BY tanggal DESC LIMIT 1"
  );
  return result.rows[0];
};

export const getCompostStats = async () => {
  const result = await pool.query(`
    SELECT 
      COUNT(*) as total_kompos,
      COUNT(CASE WHEN kualitas = 'Sesuai Standar' THEN 1 END) as sesuai_standar,
      COUNT(CASE WHEN kualitas = 'Tidak Sesuai Standar' THEN 1 END) as tidak_sesuai_standar
    FROM compost
  `);
  return result.rows[0];
};

export const getCompostRecords = async (page = 1, limit = 10) => {
  // normalize/validate inputs (controller/routes may pass strings or undefined)
  page = Number.isFinite(Number(page)) ? Math.max(1, parseInt(page, 10)) : 1;
  limit = Number.isFinite(Number(limit)) ? Math.max(1, parseInt(limit, 10)) : 10;

  const MAX_LIMIT = 100;
  limit = Math.min(limit, MAX_LIMIT);

  const offset = (page - 1) * limit;

  const result = await pool.query(
    `
    SELECT * FROM compost_view
    LIMIT $1 OFFSET $2
    `,
    [limit, offset]
  );

  const totalResult = await pool.query(`SELECT COUNT(*) AS total FROM compost_view`);
  const total = parseInt(totalResult.rows[0].total, 10) || 0;
  const totalPages = limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1;

  return {
    data: result.rows,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

export const createCompostRecord = async (data) => {
  const {
    ph,
    kadar_air,
    suhu,
    kadar_n,
    kadar_p,
    kadar_k,
    kualitas,
    keterangan,
  } = data;

  await pool.query(
    "CALL insert_compost_reading($1,$2,$3,$4,$5,$6,$7,$8,$9)",
    [
      1,
      ph,
      kadar_air,
      suhu,
      kadar_n,
      kadar_p,
      kadar_k,
      kualitas,
      keterangan,
    ]
  );
};

export async function updateCompostRecord(id, fields) {
  const setClauses = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      setClauses.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  if (setClauses.length === 0) {
    throw new Error('No fields to update');
  }

  const query = `
    UPDATE compost
    SET ${setClauses.join(', ')}
    WHERE id = $${index}
    RETURNING *;
  `;
  values.push(id);

  const result = await pool.query(query, values);
  return result.rows[0];
}

export const deleteCompostRecord = async (id) => {
  const result = await pool.query("DELETE FROM compost WHERE id = $1", [id]);
  return result.rowCount > 0;
};
