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

export const getCompostRecords = async (query) => {
  let { page = 1, limit = 10, bulan, status, keterangan, sort } = query;

  page = Number(page);
  limit = Math.min(Number(limit), 100);
  const offset = (page - 1) * limit;

  const whereClauses = [];
  const params = [];
  let paramIndex = 1;

  // --- Filter bulan ---
  if (bulan) {
    whereClauses.push(`TO_CHAR(tanggal, 'YYYY-MM') = $${paramIndex++}`);
    params.push(bulan);
  }

  // --- Filter kualitas (bukan status) ---
  if (status && ['Sesuai Standar', 'Tidak Sesuai Standar'].includes(status)) {
    whereClauses.push(`LOWER(COALESCE(kualitas, '')) = LOWER($${paramIndex++})`);
    params.push(status);
  }

  // --- Filter keterangan ---
  if (keterangan) {
    whereClauses.push(`LOWER(TRIM(COALESCE(keterangan, ''))) LIKE LOWER($${paramIndex++})`);
    params.push(`%${keterangan.trim().toLowerCase()}%`);
  }

  const whereSQL = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

  // --- Sorting ---
  let orderSQL = '';
  if (sort) {
    const validColumns = ['kadar_n', 'kadar_p', 'kadar_k'];
    const sortParts = sort.split(',').map((s) => s.trim());
    const orderList = [];

    for (const s of sortParts) {
      const [col, dir] = s.split(':');
      if (validColumns.includes(col.toLowerCase())) {
        orderList.push(`${col} ${dir?.toLowerCase() === 'asc' ? 'ASC' : 'DESC'}`);
      }
    }

    if (orderList.length > 0) orderSQL = `ORDER BY ${orderList.join(', ')}`;
  } else {
    orderSQL = `ORDER BY tanggal DESC`;
  }

  // --- Query utama ---
  const dataQuery = `
    SELECT id, tanggal, kadar_n, kadar_p, kadar_k, kualitas, keterangan
    FROM compost_view
    ${whereSQL}
    ${orderSQL}
    LIMIT $${paramIndex++} OFFSET $${paramIndex};
  `;
  params.push(limit, offset);

  const result = await pool.query(dataQuery, params);

  // --- Hitung total ---
  const countQuery = `
    SELECT COUNT(*) AS total
    FROM compost_view
    ${whereSQL};
  `;
  const totalResult = await pool.query(countQuery, params.slice(0, paramIndex - 2));
  const total = parseInt(totalResult.rows[0].total, 10) || 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: result.rows,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
};

export const getDefaultCompostRecords = async () => {
  // Query data utama (ringan)
  const result = await pool.query(`
    SELECT id, tanggal, kadar_n, kadar_p, kadar_k, kualitas, keterangan
    FROM compost_view
    ORDER BY tanggal DESC
    LIMIT 10;
  `);

  // Query total data (untuk meta)
  const totalResult = await pool.query(`SELECT COUNT(*) AS total FROM compost_view;`);
  const total = parseInt(totalResult.rows[0].total, 10) || 0;
  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return {
    data: result.rows,
    meta: {
      total,
      page: 1,
      limit,
      totalPages,
      hasNext: total > limit,
      hasPrev: false,
    },
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
