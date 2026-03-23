import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class BiddingDailyStat extends Model<InferAttributes<BiddingDailyStat>, InferCreationAttributes<BiddingDailyStat>> {
  declare id: CreationOptional<number>;
  declare date_key: string;
  declare scope_type: CreationOptional<string>;
  declare scope_value: CreationOptional<string>;
  declare count: CreationOptional<number>;
  declare total_yuan: CreationOptional<number>;
  declare total_yi: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

BiddingDailyStat.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    date_key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    scope_type: {
      type: DataTypes.STRING,
      defaultValue: 'country',
    },
    scope_value: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    total_yuan: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    total_yi: {
      type: DataTypes.STRING,
      defaultValue: '0.00',
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'bidding_daily_stats',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['date_key', 'scope_type', 'scope_value'], unique: true }],
  }
);

export default BiddingDailyStat;
