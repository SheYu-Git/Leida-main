import type { Request, Response } from 'express';
import { User, Post, Pet } from '../../models/index.js';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const userCount = await User.count();
    const postCount = await Post.count();
    const petCount = await Pet.count();

    // Get recent users
    const recentUsers = await User.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      attributes: ['id', 'username', 'nickname', 'created_at']
    });

    res.json({
      stats: {
        users: userCount,
        posts: postCount,
        pets: petCount
      },
      recentUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
