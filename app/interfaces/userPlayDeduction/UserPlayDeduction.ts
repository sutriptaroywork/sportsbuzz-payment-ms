import { ObjectId } from "mongoose";

export interface UserPlayDeductionQueryData {
  userId: string;
  userLeagueId: ObjectId;
  matchLeagueId: string;
  matchId: ObjectId;
  nPrice: number;
  nBonusUtil: number;
  sMatchName: string;
  sUserName: string;
  eType: string;
  eCategory: string;
  promoCode?: string;
  bPrivateLeague: boolean;
  joinPrice: number;
  promoDiscount?: number;
  userTeamId: ObjectId;
}