import sequelize from 'sequelize';

export interface ChannelAttributes {
  id: number;
  discordId: string;
}

export type ChannelCreationAttributes = sequelize.Optional<ChannelAttributes, 'id'>;

export class Channel
  extends sequelize.Model<ChannelAttributes, ChannelCreationAttributes>
{
  declare id: number;

  declare discordId: string;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;
}

export const ChannelModelAttributes: sequelize.ModelAttributes = {
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
