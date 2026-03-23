import express from 'express';
import { getBreeds, getBreedById, createBreed, updateBreed, deleteBreed } from '../controllers/breedController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Middleware to check if user is admin
const isAdmin = (req: any, res: any, next: any) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin only.' });
  }
};

router.get('/', getBreeds);
router.get('/:id', getBreedById);
router.post('/', authenticateToken, isAdmin, createBreed);
router.put('/:id', authenticateToken, isAdmin, updateBreed);
router.delete('/:id', authenticateToken, isAdmin, deleteBreed);

export default router;
