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
  public id!: number;

  public channelId!: number;

  public subjectId!: number;

  public userId!: number;

  public active!: boolean;

  public progress!: number;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
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
