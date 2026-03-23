import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class Follow extends Model<InferAttributes<Follow>, InferCreationAttributes<Follow>> {
  declare id: CreationOptional<number>;
  declare follower_id: number;
  declare following_id: number;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

Follow.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'follows',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['follower_id', 'following_id'],
      },
    ],
  }
);

export default Follow;
