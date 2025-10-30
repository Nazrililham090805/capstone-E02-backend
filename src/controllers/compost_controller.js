import {
  createCompostRecord,
  getAllCompostRecords,
  getCompostRecordById,
  updateCompostRecord,
  deleteCompostRecord,
  getLatestCompost,
  getCompostStats,
  getCompostRecords
} from '../models/compost_model.js';

export const CompostController = {
  async getAll(req, res) {
    try {
      const data = await getAllCompostRecords();
      res.json(data);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch compost readings' });
    }
  },

  async getById(req, res) {
    try {
      const record = await getCompostRecordById(req.params.id);
      if (!record) return res.status(404).json({ error: 'Record not found' });
      res.json(record);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch record' });
    }
  },

  async getRecords (req, res) {
    try {
      // prefer route params, fallback to query params, then defaults
      const pageStr = req.params.page ?? req.query.page ?? '1';
      const limitStr = req.params.limit ?? req.query.limit ?? '10';

      const page = Number.parseInt(pageStr, 10);
      const limitRaw = Number.parseInt(limitStr, 10);

      if (Number.isNaN(page) || Number.isNaN(limitRaw) || page < 1 || limitRaw < 1) {
        return res.status(400).json({ error: 'Invalid page or limit' });
      }

      const MAX_LIMIT = 100;
      const limit = Math.min(limitRaw, MAX_LIMIT);

      const result = await getCompostRecords(page, limit);
      res.json(result);
    } catch (err) {
      console.error('Error getting compost records:', err);
      res.status(500).json({ error: 'Failed to get compost records' });
    }
  },

  async getLatest(req, res) {
    try {
      const record = await getLatestCompost();
      if (!record) return res.status(404).json({ error: 'No records found' });
      res.json(record);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch latest record' });
    }
  },

  async getStats(req, res) {
    try {
      const stats = await getCompostStats();
      res.json(stats);
    } catch (err) {
      console.error('Error getting compost stats:', err);
      res.status(500).json({ error: 'Failed to get compost statistics' });
    }
  },

  async create(req, res) {
    try {
      const result = await createCompostRecord(req.body);
      res.status(201).json({ message: "Record inserted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to insert compost reading' });
    }
  },

  async update(req, res) {
    try {
      const updated = await updateCompostRecord(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Record not found' });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update record' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await deleteCompostRecord(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Record not found' });
      res.json({ message: 'Record deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete record' });
    }
  },
};
