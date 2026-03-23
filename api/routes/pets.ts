import { Router } from 'express';
import { getPets, createPet, getPetById, updatePet, deletePet } from '../controllers/petController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getPets);
router.post('/', createPet);
router.get('/:id', getPetById);
router.put('/:id', updatePet);
router.delete('/:id', deletePet);

export default router;
