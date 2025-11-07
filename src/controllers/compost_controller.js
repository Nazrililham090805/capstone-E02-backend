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

  async getRecords(req, res) {
  try {
    const result = await getCompostRecords(req.query);
    res.json(result);
  } catch (err) {
    console.error('Error getting compost records:', err);
    res.status(500).json({ error: 'Failed to get compost records' });
    }
  },

  async getRecordsDefault(req, res) {
    try {
      const defaultQuery = {
        page: 1,
        limit: 10,
      };
      const result = await getCompostRecords(defaultQuery);
      res.json(result);
    } catch (err) {
      console.error('Error getting default compost records:', err);
      res.status(500).json({ error: 'Failed to get default compost records' });
    }
  },

  async getRecordsDefault(req, res) {
    try {
      const result = await getDefaultCompostRecords();
      res.json(result);
    } catch (err) {
      console.error('Error getting default compost records:', err);
      res.status(500).json({ error: 'Failed to get default compost records' });
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
