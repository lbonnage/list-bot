import sequelize from 'sequelize';
import { Logger } from '../../../lib/logger.js';

const logger = Logger('user');

export interface UserAttributes {
  id: number;
  discordId: string;
}

type UserCreationAttributes = sequelize.Optional<UserAttributes, 'id'>;

export class User extends sequelize.Model<UserAttributes, UserCreationAttributes> {
  declare id: number;

  declare discordId: string;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;

  public static async FindOrCreate(discordId: string): Promise<User> {
    logger.info(`FindOrCreate called with discordId: ${discordId}.`);

    return (await User.findCreateFind({
      where: {
        discordId,
      },
    })
      .then((result) => {
        if (result[1]) {
          logger.info(`Successfully created user: ${JSON.stringify(result[0])}`);
          return User.findOne({ where: { discordId } });
        }
        logger.info(`Successfully found user: ${JSON.stringify(result[0])}`);
        return result[0];
      })
      .catch((error) => {
        logger.error(`Failed finding/creating user ${discordId} to database with error: ${error}`);
      })) as User;
  }
}

export const UserModelAttributes: sequelize.ModelAttributes = {
  id: {
    type: sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  discordId: {
    type: sequelize.DataTypes.STRING(20),
    allowNull: false,
  },
};
