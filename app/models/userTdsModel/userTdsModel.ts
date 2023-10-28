import sequelizeConnection from "@/connections/database/mysql/mysql";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { tdsStatusEnums } from "@/enums/tdsStatusEnums/tdsStatusEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { userTDSAttributes } from "@/interfaces/userTDS/userTDSInterface";
import { DataTypes, Model, Optional } from "sequelize";

export interface userTdsInput extends Optional<userTDSAttributes, "id"> {}

export interface userTdsOutput extends Required<userTDSAttributes> {}

class UserTDS extends Model<userTdsInput, userTdsOutput> implements userTDSAttributes {
  public id: DataTypes.IntegerDataType;
  public iUserId: DataTypes.StringDataType;
  public nPercentage: DataTypes.DecimalDataType;
  public nOriginalAmount: DataTypes.FloatDataType; // original amount
  public nAmount: DataTypes.FloatDataType; // TDS amount
  public nActualAmount: DataTypes.FloatDataType; // actual amount (nOriginalAmount - nAmount)
  public nEntryFee: DataTypes.FloatDataType; // Entry fee of contest
  public nTaxableAmount: DataTypes.FloatDataType;
  public iPassbookId: DataTypes.StringDataType;
  public eStatus: tdsStatusEnums;
  public eUserType: UserTypeEnums;
  public iMatchLeagueId: DataTypes.StringDataType;
  public iMatchId: DataTypes.StringDataType;
  public eCategory: CategoryTypeEnums;
  public bIsEOFY: boolean;
  public dCreatedAt: DataTypes.DateDataType;
  public dUpdatedAt: DataTypes.DateDataType;
}

UserTDS.init(
  {
    id: { type: DataTypes.INTEGER, allowNull: false, autoIncrement: true, primaryKey: true },
    iUserId: { type: DataTypes.STRING, allowNull: false },
    nPercentage: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    nOriginalAmount: { type: DataTypes.FLOAT(9, 2), allowNull: false },
    nAmount: { type: DataTypes.FLOAT(9, 2), defaultValue: 0 },
    nActualAmount: { type: DataTypes.FLOAT(9, 2), allowNull: false },
    nEntryFee: { type: DataTypes.FLOAT(9, 2), defaultValue: 0 },
    nTaxableAmount: { type: DataTypes.FLOAT(9, 2), defaultValue: 0 },
    iPassbookId: { type: DataTypes.STRING(24) },
    eStatus: {
      type: DataTypes.ENUM,
      values: [tdsStatusEnums.ACCEPTED, tdsStatusEnums.PENDING],
      defaultValue: tdsStatusEnums.PENDING,
    },
    eUserType: {
      type: DataTypes.ENUM,
      values: [UserTypeEnums.BOT, UserTypeEnums.COPY_BOT, UserTypeEnums.USER],
      defaultValue: UserTypeEnums.USER,
    },
    iMatchLeagueId: { type: DataTypes.STRING(24) },
    iMatchId: { type: DataTypes.STRING(24) },
    eCategory: {
      type: DataTypes.ENUM,
      values: [
        CategoryTypeEnums.BASE,
        CategoryTypeEnums.BASEBALL,
        CategoryTypeEnums.CRICKET,
        CategoryTypeEnums.FOOTBALL,
        CategoryTypeEnums.KABADDI,
      ],
      defaultValue: CategoryTypeEnums.CRICKET,
    },
    bIsEOFY: { type: DataTypes.BOOLEAN, defaultValue: false },
    dCreatedAt: "",
    dUpdatedAt: "",
  },
  {
    sequelize: sequelizeConnection.sequelize,
    createdAt: "dCreatedAt",
    updatedAt: "dUpdatedAt",
    tableName: "usertds",
    indexes: [
      {
        fields: ["iUserId", "eStatus"],
      },
    ],
  },
);

export default UserTDS;
