import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class BiddingSyncState extends Model<InferAttributes<BiddingSyncState>, InferCreationAttributes<BiddingSyncState>> {
  declare id: CreationOptional<number>;
  declare last_attempt_at: CreationOptional<number>;
  declare last_success_at: CreationOptional<number>;
  declare last_error: CreationOptional<string>;
  declare last_page: CreationOptional<number>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

BiddingSyncState.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    last_attempt_at: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    last_success_at: {
      type: DataTypes.BIGINT,
      defaultValue: 0,
    },
    last_error: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    last_page: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'bidding_sync_state',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default BiddingSyncState;
