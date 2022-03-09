import sequelize from 'sequelize';
import { User } from './user.model.js';
import { Logger } from '../../../lib/logger.js';

const logger = Logger('points-entry');

export enum PointsEntryType {
  USER,
  THING,
}

export interface PointsEntryAttributes {
  id: number;
  entry: number;
  entryType: PointsEntryType;
  value: number;
}

type PointsEntryCreationAttributes = sequelize.Optional<PointsEntryAttributes, 'id'>;

export class PointsEntry
  extends sequelize.Model<PointsEntryAttributes, PointsEntryCreationAttributes>
  implements PointsEntryAttributes
{
  declare id: number;

  declare entry: number;

  declare entryType: PointsEntryType;

  declare value: number;

  declare readonly updatedAt: Date;

  public static async FindOrCreate(userId: number): Promise<PointsEntry> {
    logger.info(`FindOrCreate called with userId: ${userId}.`);

    return (await PointsEntry.findCreateFind({
      where: {
        entry: userId,
        entryType: PointsEntryType.USER,
      },
    })
      .then((result) => {
        if (result[1]) {
          logger.info(`Successfully created points entry: ${JSON.stringify(result[0])}`);
          return PointsEntry.findOne({ where: { entry: userId } });
        }
        logger.info(`Successfully found points entry: ${JSON.stringify(result[0])}`);
        return result[0];
      })
      .catch((error) => {
        logger.error(`Failed finding/creating points entry for ${userId} to database with error: ${error}`);
      })) as PointsEntry;
  }

  public static async UpdateOrCreate(userId: number, value: number): Promise<PointsEntry> {
    logger.info(`UpdateOrCreate called with userId: ${userId} and value ${value}.`);

    return (await PointsEntry.upsert({
      entry: userId,
      entryType: PointsEntryType.USER,
      value: value,
    }).then((result) => {
      if (result[1]) {
        logger.info(`Successfully created points entry: ${JSON.stringify(result[0])}`);
      }
      return result[0]
    })
    .catch((error) => {
      logger.error(`Failed finding/creating points entry for  ${userId} to database with error: ${error}`);
    })) as PointsEntry; 
  }

}

export const PointsEntryModelAttributes: sequelize.ModelAttributes = {
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
    unique: true,
  },
  entryType: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    unique: false,
  },
  value: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    unique: false,
    defaultValue: 0,
  },
};