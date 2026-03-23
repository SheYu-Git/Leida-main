import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional, NonAttribute } from 'sequelize';
import sequelize from '../config/database.js';
import type User from './User.js';
import type Like from './Like.js';
import type Comment from './Comment.js';

class Post extends Model<InferAttributes<Post>, InferCreationAttributes<Post>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare content: CreationOptional<string>;
  declare images: CreationOptional<any>;
  declare likes: CreationOptional<number>;
  declare comments_count: CreationOptional<number>;
  declare location: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Associations
  declare author?: NonAttribute<User>;
  declare post_likes?: NonAttribute<Like[]>;
  declare comments?: NonAttribute<Comment[]>;
}

Post.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
    },
    images: {
      type: DataTypes.JSON,
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    comments_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    location: {
      type: DataTypes.STRING,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default Post;
