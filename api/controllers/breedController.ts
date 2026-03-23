import type { Request, Response } from 'express';
import { Breed, Pet } from '../models/index.js';
import { Op } from 'sequelize';

// Get all breeds
export const getBreeds = async (req: Request, res: Response) => {
  try {
    const { species, search } = req.query;
    const where: any = {};

    if (species && typeof species === 'string') {
      where.species = species;
    }

    if (search && typeof search === 'string') {
      where.name = { [Op.like]: `%${search}%` };
    }

    const breeds = await Breed.findAll({
      where,
      order: [['name', 'ASC']],
    });
    
    // For each breed, count pets
    // This is inefficient for large datasets but fine for MVP
    const results = await Promise.all(breeds.map(async (breed) => {
      const count = await Pet.count({ where: { breed_id: breed.id } });
      return {
        ...breed.get({ plain: true }),
        pet_count: count
      };
    }));

    res.json(results);
  } catch (error) {
    console.error('Get breeds error:', error);
    res.status(500).json({ message: '获取品种列表失败' });
  }
};

// Get breed by ID
export const getBreedById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const breed = await Breed.findByPk(id);

    if (!breed) {
      return res.status(404).json({ message: '品种不存在' });
    }

    const petCount = await Pet.count({ where: { breed_id: id } });
    
    // Get recent pets of this breed
    const recentPets = await Pet.findAll({
      where: { breed_id: id },
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'name', 'avatar', 'created_at']
    });

    res.json({
      ...breed.get({ plain: true }),
      pet_count: petCount,
      recent_pets: recentPets
    });
  } catch (error) {
    console.error('Get breed error:', error);
    res.status(500).json({ message: '获取品种详情失败' });
  }
};

// Create breed (Admin only)
export const createBreed = async (req: Request, res: Response) => {
  try {
    const { name, name_en, species, description, origin, temperament, images, lifespan, weight, height } = req.body;
    
    const breed = await Breed.create({
      name,
      name_en,
      species,
      description,
      origin,
      temperament,
      images,
      lifespan,
      weight,
      height
    });

    res.status(201).json(breed);
  } catch (error) {
    console.error('Create breed error:', error);
    res.status(500).json({ message: '创建品种失败' });
  }
};

// Update breed (Admin only)
export const updateBreed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, name_en, species, description, origin, temperament, images, lifespan, weight, height } = req.body;

    const breed = await Breed.findByPk(id);
    if (!breed) {
      return res.status(404).json({ message: '品种不存在' });
    }

    await breed.update({
      name,
      name_en,
      species,
      description,
      origin,
      temperament,
      images,
      lifespan,
      weight,
      height
    });

    res.json(breed);
  } catch (error) {
    console.error('Update breed error:', error);
    res.status(500).json({ message: '更新品种失败' });
  }
};

// Delete breed (Admin only)
export const deleteBreed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const breed = await Breed.findByPk(id);
    
    if (!breed) {
      return res.status(404).json({ message: '品种不存在' });
    }

    await breed.destroy();
    res.json({ message: '品种已删除' });
  } catch (error) {
    console.error('Delete breed error:', error);
    res.status(500).json({ message: '删除品种失败' });
  }
};
