import express from 'express';
import { CompostController } from '../controllers/compost_controller.js';

const router = express.Router();

router.get('/', CompostController.getAll);
router.get('/:id', CompostController.getById);
router.post('/', CompostController.create);
router.patch('/:id', CompostController.update);
router.delete('/:id', CompostController.delete);

export default router;
