import { Router } from 'express';
import { getPosts, createPost, getPostById } from '../controllers/postController.js';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuthenticateToken, getPosts);
router.get('/:id', optionalAuthenticateToken, getPostById);

router.post('/', authenticateToken, createPost);

export default router;
