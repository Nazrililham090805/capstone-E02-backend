import express from 'express';
import { adminController } from '../controllers/admin_controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Auth
router.post('/register', adminController.register);
router.post('/login', adminController.login);

// CRUD
router.put('/:id', authenticateToken, adminController.update);
router.delete('/:id', authenticateToken, adminController.delete);

export default router;
