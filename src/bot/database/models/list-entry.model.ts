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
  public id!: number;

  public entry!: number;

  public entryType!: ListEntryType;

  public timeAdded!: Date;

  public addedBy!: number;

  public reason!: string;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
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
