import type { Request, Response } from 'express';
import { Pet, Breed } from '../models/index.js';

interface AuthRequest extends Request {
  user?: any;
}

export const getPets = async (req: AuthRequest, res: Response) => {
  try {
    const pets = await Pet.findAll({ 
      where: { user_id: req.user.id },
      include: [
        {
          model: Breed,
          as: 'breed_info',
          attributes: ['id', 'name', 'species']
        }
      ]
    });
    res.json(pets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createPet = async (req: AuthRequest, res: Response) => {
  try {
    const { name, breed_id, age, gender, avatar } = req.body;
    
    // Validate breed exists if provided
    let breedInfo;
    if (breed_id) {
      breedInfo = await Breed.findByPk(breed_id);
      if (!breedInfo) {
        return res.status(400).json({ message: 'Selected breed does not exist' });
      }
    }

    const pet = await Pet.create({
      user_id: req.user.id,
      name,
      breed_id,
      breed_name: breedInfo ? breedInfo.name : 'Unknown', // Keep for backward compatibility
      age,
      gender,
      avatar
    });
    
    // Fetch with breed info
    const newPet = await Pet.findByPk(pet.id, {
      include: [
        {
          model: Breed,
          as: 'breed_info',
          attributes: ['id', 'name', 'species']
        }
      ]
    });

    res.status(201).json(newPet);
  } catch (error) {
    console.error('Create pet error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getPetById = async (req: AuthRequest, res: Response) => {
  try {
    const pet = await Pet.findOne({ 
      where: { id: req.params.id, user_id: req.user.id },
      include: [
        {
          model: Breed,
          as: 'breed_info',
          attributes: ['id', 'name', 'species', 'description', 'temperament', 'origin']
        }
      ]
    });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updatePet = async (req: AuthRequest, res: Response) => {
  try {
    const pet = await Pet.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    
    // If breed_id is updated, we might need to update breed_name too
    if (req.body.breed_id) {
      const breed = await Breed.findByPk(req.body.breed_id);
      if (breed) {
        req.body.breed_name = breed.name;
      }
    }

    await pet.update(req.body);
    res.json(pet);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deletePet = async (req: AuthRequest, res: Response) => {
  try {
    const pet = await Pet.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!pet) {
      return res.status(404).json({ message: 'Pet not found' });
    }
    await pet.destroy();
    res.json({ message: 'Pet deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
