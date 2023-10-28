import { ObjectId } from "mongoose";

export interface MatchLeaugeWinsInterface {
  iMatchLeagueId: ObjectId;
  iUserLeagueId: ObjectId;
  nRealCash: number;
  nBonus: number;
  aExtraWin: Array<ExtraWin>;
}

export interface ExtraWin {
  sInfo: { type: String };
  sImage: { type: String; trim: true };
}
