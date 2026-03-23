import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class Like extends Model<InferAttributes<Like>, InferCreationAttributes<Like>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare post_id: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Like.init(
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
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'likes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'post_id'],
      },
    ],
  }
);

export default Like;
