import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { ObjectId } from "mongodb";

export interface TotalMatch {
  iMatchId: ObjectId;
  nPlayReturn: number;
}

export interface MatchPlayed {
  iMatchId: ObjectId;
  nPlayReturn: number;
}

export interface SportStats {
  aMatchPlayed: Array<MatchPlayed>;
  nJoinLeague: number;
  nSpending: number;
  nSpendingCash: number;
  nSpendingBonus: number;
  nWinAmount: number;
  nWinCount: number;
  nCashbackCash: number;
  nCashbackCashCount: number;
  nCashbackBonus: number;
  nCashbackBonusCount: number;
  nCashbackAmount: number;
  nCashbackCount: number;
  nCashbackReturnCash: number;
  nCashbackReturnCashCount: number;
  nCashbackReturnBonus: number;
  nCashbackReturnBonusCount: number;
  nPlayReturn: number;
  nCreatePLeague: number;
  nJoinPLeague: number;
  nCreatePLeagueSpend: number;
  nJoinPLeagueSpend: number;
  nDiscountAmount: number;
  nTDSAmount: number;
  nTDSCount: number;
}

export interface StatisticAttributes {
  iUserId: ObjectId | string;
  eUserType: UserTypeEnums;
  oCricket: SportStats;
  oBaseball: SportStats;
  oFootball: SportStats;
  oBasketball: SportStats;
  oKabaddi: SportStats;
  nTDSAmount: number;
  nTDSCount: number;
  nTotalWinReturn: number;
  nTotalPlayReturn: number;

  nTotalPlayedCash: number;
  nTotalPlayedBonus: number;
  nTotalPlayReturnCash: number;
  nTotalPlayReturnBonus: number;

  nCashbackCash: number;
  nCashbackBonus: number;
  nTotalCashbackReturnCash: number;
  nTotalCashbackReturnBonus: number;

  nDeposits: number;
  nBonus: number;
  nWithdraw: number;
  nTotalWinnings: number;

  nActualDepositBalance: number;
  nActualWinningBalance: number;
  nActualBonus: number;

  aTotalMatch: Array<TotalMatch>;
  nTotalPLeagueSpend: number;
  nTotalSpend: number;
  nReferrals: number;
  nTotalJoinLeague: number;
  nTotalBonusExpired: number;
  nWinnings: number;
  nCash: number;
  nDepositCount: number;
  nWithdrawCount: number;
  nDiscountAmount: number;
  nDepositDiscount: number;
  nTeams: number;
  sExternalId: string;

  createdAt?: Date;
  updatedAt?: Date;
}
