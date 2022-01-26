import sequelize from 'sequelize';
import { User } from './user.model.js';

export enum ListEntryType {
  USER,
  THING,
}

export interface ListEntryAttributes {
  id: number;
  entry: number;
  entryType: ListEntryType;
  timeAdded: Date;
  addedBy: number;
  reason: string;
}

type ListEntryCreationAttributes = sequelize.Optional<ListEntryAttributes, 'id'>;

export class ListEntry
  extends sequelize.Model<ListEntryAttributes, ListEntryCreationAttributes>
  implements ListEntryAttributes
{
  declare id: number;

  declare entry: number;

  declare entryType: ListEntryType;

  declare timeAdded: Date;

  declare addedBy: number;

  declare reason: string;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;
}

export const ListEntryModelAttributes: sequelize.ModelAttributes = {
  id: {
    type: sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  entry: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    unique: false,
  },
  entryType: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    unique: false,
  },
  timeAdded: {
    type: sequelize.DataTypes.DATE,
    allowNull: false,
    unique: false,
  },
  addedBy: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onUpdate: 'CASCADE',
    unique: false,
  },
  reason: {
    type: sequelize.DataTypes.STRING,
    allowNull: true,
    unique: false,
  },
};
