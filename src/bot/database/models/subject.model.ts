import sequelize from 'sequelize';

export enum SubjectType {
  ANIME,
  MANGA,
  NEXUS,
  CURSEFORGE,
}

export interface SubjectAttributes {
  id: number;
  discordId: string;
  lastUpdatedTime: Date;
  subjectType: SubjectType;
}

type SubjectCreationAttributes = sequelize.Optional<SubjectAttributes, 'id'>;

export class Subject
  extends sequelize.Model<SubjectAttributes, SubjectCreationAttributes>
  implements SubjectAttributes
{
  declare id: number;

  declare discordId: string;

  declare lastUpdatedTime: Date;

  declare subjectType: SubjectType;

  declare readonly createdAt: Date;

  declare readonly updatedAt: Date;
}

export const SubjectModelAttributes: sequelize.ModelAttributes = {
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
