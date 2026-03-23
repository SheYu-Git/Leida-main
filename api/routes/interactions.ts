import express from 'express';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';
import {
  toggleLike,
  createComment,
  getComments,
  toggleFollow,
  getUserProfile,
} from '../controllers/interactionController.js';

const router = express.Router();

// Like Routes
router.post('/posts/:id/like', authenticateToken, toggleLike);

// Comment Routes
router.post('/posts/:id/comments', authenticateToken, createComment);
router.get('/posts/:id/comments', getComments); // Comments are public

// Follow Routes
router.post('/users/:id/follow', authenticateToken, toggleFollow);

// Profile Routes
router.get('/users/:id/profile', optionalAuthenticateToken, getUserProfile);

export default router;
