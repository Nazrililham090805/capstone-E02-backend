import express from 'express';
import { CompostController } from '../controllers/compost_controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', CompostController.getAll);
router.get('/stats', CompostController.getStats);
router.get('/records', CompostController.getRecords);
router.get('/latest', CompostController.getLatest);
router.get('/:id', CompostController.getById);

router.post('/', CompostController.create);
router.patch('/:id', authenticateToken, CompostController.update);
router.delete('/:id', authenticateToken, CompostController.delete);

export default router;
