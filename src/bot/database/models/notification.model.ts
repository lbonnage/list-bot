import sequelize from 'sequelize';
import { Channel } from './channel.model.js';
import { Subject } from './subject.model.js';
import { User } from './user.model.js';

export interface NotificationAttributes {
  id: number;
  channelId: number;
  subjectId: number;
  userId: number;
  active: boolean;
  progress: number;
}

type NotificationCreationAttributes = sequelize.Optional<NotificationAttributes, 'id'>;

export class Notification
  extends sequelize.Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  declare id: number;

  declare channelId: number;

  declare subjectId: number;

  declare userId: number;

  declare active: boolean;

  declare progress: number;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;
}

export const NotificationModelAttributes: sequelize.ModelAttributes = {
  id: {
    type: sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  channelId: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Channel,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  subjectId: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Subject,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  userId: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  active: {
    type: sequelize.DataTypes.BOOLEAN,
    allowNull: false,
  },
  progress: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: true,
  },
};
