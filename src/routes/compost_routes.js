import express from 'express';
import { CompostController } from '../controllers/compost_controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', CompostController.getAll);
router.get('/:id', CompostController.getById);
router.post('/', CompostController.create);
router.patch('/:id',authenticateToken, CompostController.update);
router.delete('/:id', authenticateToken, CompostController.delete);

export default router;
