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
  public id!: number;

  public discordId!: string;

  public lastUpdatedTime!: Date;

  public subjectType!: SubjectType;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
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
