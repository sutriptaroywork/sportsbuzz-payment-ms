import defaultValue from "@/connections/rabbitmq/rabbitmq";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { tdsStatusEnums } from "@/enums/tdsStatusEnums/tdsStatusEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { User } from "aws-sdk/clients/budgets";
import { DataTypes, DateDataType } from "sequelize";

export interface userTDSAttributes {
  id: DataTypes.IntegerDataType;
  iUserId: DataTypes.StringDataType;
  nPercentage: DataTypes.DecimalDataType;
  nOriginalAmount: DataTypes.FloatDataType; // original amount
  nAmount: DataTypes.FloatDataType; // TDS amount
  nActualAmount: DataTypes.FloatDataType; // actual amount (nOriginalAmount - nAmount)
  nEntryFee: DataTypes.FloatDataType; // Entry fee of contest
  nTaxableAmount: DataTypes.FloatDataType;
  iPassbookId: DataTypes.StringDataType;
  eStatus: tdsStatusEnums;
  eUserType: UserTypeEnums;
  iMatchLeagueId: DataTypes.StringDataType;
  iMatchId: DataTypes.StringDataType;
  eCategory: CategoryTypeEnums;
  bIsEOFY: boolean;
  dCreatedAt: DateDataType;
  dUpdatedAt: DateDataType;
}
