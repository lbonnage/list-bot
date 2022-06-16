import sequelize from 'sequelize';
import { Logger } from '../../../lib/logger.js';

const logger = Logger('track-model');

export interface TrackAttributes {
  id: number;
  showId: number;
  name: string;
  episodesWatched: number;
  latestEpisode: number;
  airing: boolean;
}

type TrackCreationAttributes = sequelize.Optional<TrackAttributes, 'id'>;

export class Track extends sequelize.Model<TrackAttributes, TrackCreationAttributes> {
  declare id: number;

  declare showId: number;

  declare name: string;

  declare episodesWatched: number;

  declare latestEpisode: number;

  declare airing: boolean;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;
}

export const TrackModelAttributes: sequelize.ModelAttributes = {
  id: {
    type: sequelize.DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  showId: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },
  name: {
    type: sequelize.DataTypes.STRING,
    allowNull: false,
  },
  episodesWatched: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
  },
  latestEpisode: {
    type: sequelize.DataTypes.INTEGER,
    allowNull: false,
  },
  airing: {
    type: sequelize.DataTypes.BOOLEAN,
    allowNull: false,
  }
}