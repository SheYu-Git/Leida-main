import { DataTypes, Model } from 'sequelize';
import type { InferAttributes, InferCreationAttributes, CreationOptional } from 'sequelize';
import sequelize from '../config/database.js';

class AppConfigVersion extends Model<InferAttributes<AppConfigVersion>, InferCreationAttributes<AppConfigVersion>> {
  declare id: CreationOptional<number>;
  declare key: string;
  declare version: number;
  declare value_json: CreationOptional<string>;
  declare created_by_user_id: CreationOptional<number | null>;
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
}

AppConfigVersion.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    key: { type: DataTypes.STRING(120), allowNull: false },
    version: { type: DataTypes.INTEGER, allowNull: false },
    value_json: { type: DataTypes.TEXT, defaultValue: '{}' },
    created_by_user_id: { type: DataTypes.INTEGER, allowNull: true },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'app_config_versions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['key', 'version'], unique: true },
      { fields: ['key', 'created_at'] },
    ],
  }
);

export default AppConfigVersion;
