import sequelize from 'sequelize';
import { Logger } from '../../../lib/logger.js';
import { Channel, ChannelModelAttributes } from './channel.model.js';
import { Subject, SubjectModelAttributes } from './subject.model.js';
import { User, UserModelAttributes } from './user.model.js';
import { Notification, NotificationModelAttributes } from './notification.model.js';
import { ListEntry, ListEntryModelAttributes } from './list-entry.model.js';
import { PointsEntry, PointsEntryModelAttributes } from './points-entry.model.js';
import { Track, TrackModelAttributes } from './track.model.js';

const logger = Logger('sequelize');

// Create the database
export const database = new sequelize.Sequelize({
  dialect: 'sqlite',
  database: 'database.db',
  storage: process.env.DATABASE_PATH,
  logging: process.env.NODE_ENV === 'development' ? logger.debug.bind(logger) : false,
});

Channel.init(ChannelModelAttributes, {
  sequelize: database,
  tableName: 'channels',
});
await Channel.sync();

Subject.init(SubjectModelAttributes, {
  sequelize: database,
  tableName: 'subjects',
});
await Subject.sync();

User.init(UserModelAttributes, {
  sequelize: database,
  tableName: 'users',
});
await User.sync();

Notification.init(NotificationModelAttributes, {
  sequelize: database,
  tableName: 'notifications',
});
await Notification.sync();

ListEntry.init(ListEntryModelAttributes, {
  sequelize: database,
  tableName: 'list_entries',
});
await ListEntry.sync();

PointsEntry.init(PointsEntryModelAttributes, {
  sequelize: database,
  tableName: 'points_entries',
});
await PointsEntry.sync();

Track.init(TrackModelAttributes, {
  sequelize: database,
  tableName: 'track',
})
await Track.sync();