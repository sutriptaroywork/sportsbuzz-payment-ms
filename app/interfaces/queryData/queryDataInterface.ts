import { ObjectId } from "mongoose";

export default interface queryDataStatsService {
  userId: string;
  matchCategory: string;
  leagueJoinAmount: number;
  nPrice: number;
  nActualBonus: number;
  matchId: string;
  nCash: number;
  nWin: number;
  nPromoDiscount: number;
  leagueTypeStat: any; //TODO: need to change this after testing.
  query: any; //TODO: need to change this after testing.
}
