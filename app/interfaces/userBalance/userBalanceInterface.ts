import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { DataTypes } from "sequelize";

export interface UserBalanceAttributes {
  id: DataTypes.IntegerDataType;
  iUserId: string;
  nCurrentWinningBalance: number;
  nCurrentDepositBalance: number;
  nCurrentTotalBalance: number;
  nCurrentBonus: number;
  nExpiredBonus: number;
  nTotalBonusEarned: number;
  nTotalBonusReturned: number;
  nTotalCashbackReturned: number;
  nTotalWinningAmount: number;
  nTotalDepositAmount: number;
  nTotalDepositCount: number;
  nTotalWithdrawAmount: number;
  nTotalWithdrawCount: number;
  nTotalLoyaltyPoints: number;
  eUserType: UserTypeEnums;
}
