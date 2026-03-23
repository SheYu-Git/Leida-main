import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class BiddingItem extends Model<InferAttributes<BiddingItem>, InferCreationAttributes<BiddingItem>> {
  declare id: number;
  declare title: CreationOptional<string>;
  declare datetime: CreationOptional<string>;
  declare datetime_ts: CreationOptional<number>;
  declare bid_price: CreationOptional<string>;
  declare bid_price_yuan: CreationOptional<number>;
  declare url: CreationOptional<string>;
  declare city: CreationOptional<string>;
  declare province: CreationOptional<string>;
  declare purchaser: CreationOptional<string>;
  declare types: CreationOptional<string>;
  declare txt: CreationOptional<string>;
  declare class: CreationOptional<string>;
  declare detail_text: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

BiddingItem.init(
  {
    id: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false,
    },
    title: DataTypes.STRING,
    datetime: DataTypes.STRING,
    datetime_ts: DataTypes.BIGINT,
    bid_price: DataTypes.STRING,
    bid_price_yuan: DataTypes.BIGINT,
    url: DataTypes.STRING,
    city: DataTypes.STRING,
    province: DataTypes.STRING,
    purchaser: DataTypes.STRING,
    types: DataTypes.STRING,
    txt: DataTypes.STRING,
    class: DataTypes.STRING,
    detail_text: DataTypes.TEXT,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'bidding_items',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['datetime_ts'] },
      { fields: ['city'] },
      { fields: ['province'] },
      { fields: ['types'] },
    ],
  }
);

export default BiddingItem;
