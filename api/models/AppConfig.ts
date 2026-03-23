import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class AppConfig extends Model<InferAttributes<AppConfig>, InferCreationAttributes<AppConfig>> {
  declare id: CreationOptional<number>;
  declare key: string;
  declare draft_value_json: CreationOptional<string>;
  declare published_value_json: CreationOptional<string>;
  declare version: CreationOptional<number>;
  declare updated_by_user_id: CreationOptional<number | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

AppConfig.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    draft_value_json: { type: DataTypes.TEXT, defaultValue: '{}' },
    published_value_json: { type: DataTypes.TEXT, defaultValue: '{}' },
    version: { type: DataTypes.INTEGER, defaultValue: 1 },
    updated_by_user_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'app_configs',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export default AppConfig;
