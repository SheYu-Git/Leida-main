import express from 'express';
import { identifyPet, upload } from '../controllers/aiController.js';

const router = express.Router();

// Route for identifying a pet from an uploaded image
// Accepts 'image' field in multipart/form-data
router.post('/identify', upload.single('image'), identifyPet);

export default router;
