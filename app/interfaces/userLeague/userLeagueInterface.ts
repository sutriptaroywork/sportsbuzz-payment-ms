import { ObjectId } from "mongodb";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { ExtraWin } from "../matchLeaugeWins/matchLeaugeWinsInterface";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";

export interface UserLeagueAttributes {
  _id?: ObjectId;
  iUserTeamId: ObjectId;
  iUserId: ObjectId;
  iMatchLeagueId: ObjectId;
  iMatchId: ObjectId;
  nTotalPayout: number;
  nPoolPrice: boolean;
  nTotalPoints: number;
  sPayoutBreakupDesign: string;
  nRank: number;
  nPrice: number; // Real Money win
  aExtraWin: Array<ExtraWin>;
  nBonusWin: number;
  sUserName: string;
  eType: UserTypeEnums;
  sProPic: string;
  sTeamName: string;
  sMatchName: string;
  sLeagueName: string;
  ePlatform: PlatformTypesEnums;
  iPromocodeId: ObjectId;
  nPromoDiscount: number;
  nOriginalPrice: number;
  nPricePaid: number;
  actualCashUsed: number;
  actualBonusUsed: number;
  eCategory: CategoryTypeEnums;
  bPointCalculated: boolean;
  bRankCalculated: boolean;
  bPrizeCalculated: boolean;
  bWinDistributed: boolean;
  sExternalId: string;
  bCancelled: boolean;
  bSwapped: boolean;
  bIsDuplicated: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserLeaguePayloadData {
  iUserTeamId: ObjectId;
  iUserId: string;
  eType: UserTypeEnums;
  eCategory: CategoryTypeEnums;
  iMatchLeagueId: string;
  iMatchId: ObjectId;
  nTotalPayout: number;
  nPoolPrice: boolean;
  sPayoutBreakupDesign: string;
  sTeamName: string;
  sMatchName: string;
  sLeagueName: string;
  sUserName: string;
  ePlatform: string;
  sProPic: string;
  nOriginalPrice: number;
  iPromocodeId?: ObjectId;
  nPromoDiscount?: number;
  nPricePaid: number;
  sType: string;
  bAfterMinJoin: boolean;
}

export interface returnMessageResponse {
  nAmount?: number;
  isSuccess: boolean;
}
