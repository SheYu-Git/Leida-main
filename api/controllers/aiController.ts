import type { Request, Response } from 'express';
import { Breed } from '../models/index.js';
import multer from 'multer';

// Configure multer for memory storage
const storage = multer.memoryStorage();
export const upload = multer({ storage: storage });

export const identifyPet = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传图片' });
    }

    // SIMULATION: In a real app, we would send req.file.buffer to an AI service (e.g., OpenAI Vision, Google Cloud Vision)
    // For now, we will simulate the AI by:
    // 1. Checking if the filename contains a breed name (for testing)
    // 2. Otherwise, picking a random breed from our database
    
    const filename = req.file.originalname.toLowerCase();
    let breed;

    // Try to find by filename hint
    if (filename.includes('dog') || filename.includes('cat') || filename.includes('retriever')) {
        const allBreeds = await Breed.findAll();
        breed = allBreeds.find(b => filename.includes(b.name.toLowerCase()));
    }

    // Fallback: Random breed
    if (!breed) {
      const count = await Breed.count();
      const random = Math.floor(Math.random() * count);
      breed = await Breed.findOne({ offset: random });
    }

    if (!breed) {
        return res.status(404).json({ message: '无法识别该宠物' });
    }

    // Simulate AI processing delay (1-2 seconds)
    await new Promise(resolve => setTimeout(resolve, 1500));

    res.json({
      success: true,
      breed: breed,
      confidence: 0.95 + (Math.random() * 0.04) // Fake confidence score 95-99%
    });

  } catch (error) {
    console.error('AI Identification error:', error);
    res.status(500).json({ message: '识别服务暂时不可用' });
  }
};
