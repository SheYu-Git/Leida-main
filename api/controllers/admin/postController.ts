import type { Request, Response } from 'express';
import { Post, User } from '../../models/index.js';

export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findByPk(id);
    
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    await post.destroy();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
