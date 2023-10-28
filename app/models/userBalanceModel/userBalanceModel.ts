import sequelizeConnection from "@/connections/database/mysql/mysql";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { UserBalanceAttributes } from "@/interfaces/userBalance/userBalanceInterface";
import { DataTypes, Model, Optional } from "sequelize";

export interface UserBalanceInput
  extends Optional<
    UserBalanceAttributes,
    | "id"
    | "nCurrentWinningBalance"
    | "nCurrentDepositBalance"
    | "nCurrentTotalBalance"
    | "nCurrentBonus"
    | "nExpiredBonus"
    | "nTotalBonusEarned"
    | "nTotalBonusReturned"
    | "nTotalCashbackReturned"
    | "nTotalWinningAmount"
    | "nTotalDepositAmount"
    | "nTotalDepositCount"
    | "nTotalWithdrawAmount"
    | "nTotalWithdrawCount"
    | "nTotalLoyaltyPoints"
    | "eUserType"
  > {
  iUserId: string;
  eUserType: UserTypeEnums;
}
export interface UserBalanceOutput extends Required<UserBalanceAttributes> {}

class UserBalance extends Model<UserBalanceInput, UserBalanceOutput> implements UserBalanceAttributes {
  public id: DataTypes.IntegerDataType;
  public iUserId: string;
  public nCurrentWinningBalance: number;
  public nCurrentDepositBalance: number;
  public nCurrentTotalBalance: number;
  public nCurrentBonus: number;
  public nExpiredBonus: number;
  public nTotalBonusEarned: number;
  public nTotalBonusReturned: number;
  public nTotalCashbackReturned: number;
  public nTotalWinningAmount: number;
  public nTotalDepositAmount: number;
  public nTotalDepositCount: number;
  public nTotalWithdrawAmount: number;
  public nTotalWithdrawCount: number;
  public nTotalLoyaltyPoints: number;
  public eUserType: UserTypeEnums;
}

UserBalance.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    },
    iUserId: {
      type: DataTypes.STRING(24),
      allowNull: false,
    },
    nCurrentWinningBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nCurrentDepositBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nCurrentTotalBalance: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nCurrentBonus: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nExpiredBonus: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nTotalBonusEarned: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nTotalBonusReturned: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nTotalCashbackReturned: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nTotalWinningAmount: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nTotalDepositAmount: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nTotalDepositCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    nTotalWithdrawAmount: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    nTotalWithdrawCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    nTotalLoyaltyPoints: {
      type: DataTypes.FLOAT(12, 2),
      defaultValue: 0,
    },
    eUserType: {
      type: DataTypes.ENUM,
      values: [UserTypeEnums.USER, UserTypeEnums.BOT, UserTypeEnums.COPY_BOT],
      defaultValue: UserTypeEnums.USER,
    },
  },
  {
    createdAt: "dCreatedAt",
    updatedAt: "dUpdatedAt",
    tableName: "userbalances",
    indexes: [
      {
        fields: ["iUserId"],
      },
    ],
    sequelize: sequelizeConnection.sequelize,
  },
);

export default UserBalance;
