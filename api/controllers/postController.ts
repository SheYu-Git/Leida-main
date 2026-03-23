import type { Request, Response } from 'express';
import { Post, User, Like, Comment, Follow } from '../models/index.js';
import { Op } from 'sequelize';

interface AuthRequest extends Request {
  user?: any;
}

export const getPosts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type } = req.query;
    
    let where: any = {};

    // Filter logic
    if (type === 'follow' && userId) {
      // Get list of user IDs that the current user follows
      const follows = await Follow.findAll({
        where: { follower_id: userId },
        attributes: ['following_id']
      });
      const followingIds = follows.map(f => f.following_id);
      
      // Add current user's ID to see own posts too (optional, but common)
      followingIds.push(userId);

      where.user_id = { [Op.in]: followingIds };
    } else if (type === 'nearby') {
      // Mock nearby: Filter by 'location' not null or specific string if needed
      // For now, let's just show posts with location data
      where.location = { [Op.ne]: null };
    }
    // 'recommend' or default: show all

    const posts = await Post.findAll({
      where,
      include: [
        { 
          model: User, 
          as: 'author', 
          attributes: ['id', 'username', 'nickname', 'avatar'] 
        },
        {
          model: Like,
          as: 'post_likes',
          where: userId ? { user_id: userId } : undefined,
          required: false,
          attributes: ['id']
        }
      ],
      order: [['created_at', 'DESC']]
    });

    // Transform result to include 'liked' boolean
    const result = posts.map((post: any) => {
      const plainPost = post.get({ plain: true });
      return {
        ...plainPost,
        liked: userId ? plainPost.post_likes && plainPost.post_likes.length > 0 : false,
        post_likes: undefined // Hide the array
      };
    });

    res.json(result);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { content, images, location } = req.body;
    const post = await Post.create({
      user_id: req.user.id,
      content,
      images,
      location
    });
    
    // Fetch with author info
    const newPost = await Post.findByPk(post.id, {
      include: [{ model: User, as: 'author', attributes: ['id', 'username', 'nickname', 'avatar'] }]
    });

    if (newPost) {
      const result = newPost.get({ plain: true });
      res.status(201).json({ ...result, liked: false });
    } else {
      res.status(500).json({ message: 'Failed to create post' });
    }
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getPostById = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const post = await Post.findByPk(req.params.id, {
      include: [
        { model: User, as: 'author', attributes: ['id', 'username', 'nickname', 'avatar'] },
        {
          model: Like,
          as: 'post_likes',
          where: userId ? { user_id: userId } : undefined,
          required: false,
          attributes: ['id']
        }
      ]
    });

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const plainPost = post.get({ plain: true });
    const result = {
      ...plainPost,
      liked: userId ? plainPost.post_likes && plainPost.post_likes.length > 0 : false,
      post_likes: undefined
    };

    res.json(result);
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
