import type { Request, Response } from 'express';
import { User } from '../../models/index.js';

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin user' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
