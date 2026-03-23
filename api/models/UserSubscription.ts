import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class UserSubscription extends Model<InferAttributes<UserSubscription>, InferCreationAttributes<UserSubscription>> {
  declare id: CreationOptional<number>;
  declare user_id: number;
  declare keywords_json: CreationOptional<string>;
  declare scope_type: CreationOptional<'city' | 'province' | 'country'>;
  declare scope_value: CreationOptional<string>;
  declare push_enabled: CreationOptional<boolean>;
  declare unread_count: CreationOptional<number>;
  declare last_check_at: CreationOptional<Date | null>;
  declare last_read_at: CreationOptional<Date | null>;
  declare read_item_ids_json: CreationOptional<string>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

UserSubscription.init(
  {
    id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
    user_id: { type: DataTypes.INTEGER, allowNull: false },
    keywords_json: { type: DataTypes.TEXT, defaultValue: '[]' },
    scope_type: { type: DataTypes.ENUM('city', 'province', 'country'), defaultValue: 'country' },
    scope_value: { type: DataTypes.STRING, defaultValue: '' },
    push_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
    unread_count: { type: DataTypes.INTEGER, defaultValue: 0 },
    last_check_at: { type: DataTypes.DATE, allowNull: true },
    last_read_at: { type: DataTypes.DATE, allowNull: true },
    read_item_ids_json: { type: DataTypes.TEXT, defaultValue: '[]' },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'user_subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [{ fields: ['user_id'] }],
  }
);

export default UserSubscription;
