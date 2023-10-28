import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";
import { PassbookOutput } from "@/models/passbookModel/passbookModel";

export interface PassbookAttributes {
  id?: number;
  iUserId: string;
  nAmount: number;
  nBonus: number;
  nCash: number;
  nOldWinningBalance: number;
  nOldDepositBalance: number;
  nOldTotalBalance: number;
  nNewWinningBalance: number;
  nNewDepositBalance: number;
  nNewTotalBalance: number;
  nOldBonus: number;
  nNewBonus: number;
  eTransactionType: string;
  dBonusExpiryDate: Date;
  bIsBonusExpired: boolean;
  bCreatorBonusReturn: boolean;
  bWinReturn: boolean;
  iPreviousId: number;
  iUserLeagueId: string;
  iMatchId: string;
  iMatchLeagueId: string;
  iSeriesId: string;
  iCategoryId: string;
  sPromocode: string;
  iTransactionId: string;
  iUserDepositId: string;
  iWithdrawId: string;
  nWithdrawFee: number;
  sRemarks: string;
  sCommonRule: string;
  eUserType: string;
  eStatus: string;
  eType: string;
  nLoyaltyPoint: string;
  eCategory: string;
  dActivityDate: Date;
  dProcessedDate: Date;
}

export default interface passbookListInterface {
   nLimit: any, nOffset: any, eType: string, dStartDate: string, dEndDate: string, iUserId: string
}

