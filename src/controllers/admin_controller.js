import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import {
  createAdmin,
  getAdminByUsername,
  updateAdmin,
  deleteAdmin
} from '../models/admin_model.js';

dotenv.config();

export const adminController = {
  async register(req, res) {
    try {
      const { username, password } = req.body;
      const existing = await getAdminByUsername(username);
      if (existing) return res.status(400).json({ error: 'Username already exists' });

      const admin = await createAdmin(username, password);
      res.status(201).json(admin);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to register admin' });
    }
  },

  async login(req, res) {
    try {
      const { username, password } = req.body;
      const admin = await getAdminByUsername(username);
      if (!admin) return res.status(400).json({ error: 'Invalid username or password' });

      const match = await bcrypt.compare(password, admin.password);
      if (!match) return res.status(400).json({ error: 'Invalid username or password' });

      const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      res.json({ message: 'Login successful', token });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  async update(req, res) {
    try {
      const updated = await updateAdmin(req.params.id, req.body.username, req.body.password);
      if (!updated) return res.status(404).json({ error: 'Admin not found' });
      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update admin' });
    }
  },

  async delete(req, res) {
    try {
      const deleted = await deleteAdmin(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Admin not found' });
      res.json({ message: 'Admin deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete admin' });
    }
  }
};
