import type { Request, Response } from 'express';
import { User, Post, Comment, Like, Follow, Pet } from '../models/index.js';

// Toggle Like
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Post ID
    const userId = (req as any).user.id;

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    const existingLike = await Like.findOne({
      where: {
        user_id: userId,
        post_id: id,
      },
    });

    if (existingLike) {
      // Unlike
      await existingLike.destroy();
      await post.decrement('likes');
      return res.json({ message: '取消点赞成功', liked: false });
    } else {
      // Like
      await Like.create({
        user_id: userId,
        post_id: parseInt(id),
      });
      await post.increment('likes');
      return res.json({ message: '点赞成功', liked: true });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ message: '操作失败' });
  }
};

// Create Comment
export const createComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Post ID
    const { content } = req.body;
    const userId = (req as any).user.id;

    if (!content) {
      return res.status(400).json({ message: '评论内容不能为空' });
    }

    const post = await Post.findByPk(id);
    if (!post) {
      return res.status(404).json({ message: '帖子不存在' });
    }

    const comment = await Comment.create({
      user_id: userId,
      post_id: parseInt(id),
      content,
    });

    await post.increment('comments_count');

    // Fetch the created comment with user info
    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'username', 'avatar'],
        },
      ],
    });

    res.status(201).json(commentWithUser);
  } catch (error) {
    console.error('Comment error:', error);
    res.status(500).json({ message: '评论失败' });
  }
};

// Get Comments
export const getComments = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Post ID

    const comments = await Comment.findAll({
      where: { post_id: id },
      include: [
        {
          model: User,
          as: 'author',
          attributes: ['id', 'nickname', 'username', 'avatar'],
        },
      ],
      order: [['created_at', 'ASC']],
    });

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ message: '获取评论失败' });
  }
};

// Toggle Follow
export const toggleFollow = async (req: Request, res: Response) => {
  try {
    const { id } = req.params; // Target User ID
    const followerId = (req as any).user.id;
    const followingId = parseInt(id);

    if (followerId === followingId) {
      return res.status(400).json({ message: '不能关注自己' });
    }

    const targetUser = await User.findByPk(followingId);
    if (!targetUser) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const existingFollow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (existingFollow) {
      // Unfollow
      await existingFollow.destroy();
      return res.json({ message: '取消关注成功', following: false });
    } else {
      // Follow
      await Follow.create({
        follower_id: followerId,
        following_id: followingId,
      });
      return res.json({ message: '关注成功', following: true });
    }
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ message: '操作失败' });
  }
};

// Get User Profile (with stats and follow status)
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = (req as any).user?.id; // Optional, might be public

    const user = await User.findByPk(id, {
      attributes: ['id', 'username', 'nickname', 'avatar', 'role', 'created_at'],
      include: [
        {
          model: Post,
          as: 'posts',
          limit: 10,
          order: [['created_at', 'DESC']],
        },
        {
          model: Pet,
          as: 'pets',
        }
      ],
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // Get stats
    const followersCount = await Follow.count({ where: { following_id: id } });
    const followingCount = await Follow.count({ where: { follower_id: id } });
    const postsCount = await Post.count({ where: { user_id: id } });
    
    // Calculate total likes received
    const userPosts = await Post.findAll({ where: { user_id: id }, attributes: ['likes'] });
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);

    let isFollowing = false;
    if (currentUserId) {
      const follow = await Follow.findOne({
        where: {
          follower_id: currentUserId,
          following_id: id,
        },
      });
      isFollowing = !!follow;
    }

    res.json({
      user,
      stats: {
        followers: followersCount,
        following: followingCount,
        posts: postsCount,
        likes: totalLikes,
      },
      isFollowing,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
};
