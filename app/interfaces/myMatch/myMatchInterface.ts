import { ObjectId } from "mongodb";
import { MatchStatus } from "@/enums/matchStatus/matchStatus";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { ExtraWin, MatchLeaugeWinsInterface } from "../matchLeaugeWins/matchLeaugeWinsInterface";
import { matchLeaugeCashBackInterface } from "../matchLeaugeCashBack/matchLeaugeCashBackInterface";

export interface MyMatchAttributes {
  _id: ObjectId;
  iUserId: ObjectId;
  aMatchLeagueId: Array<ObjectId>;
  aCMatchLeagueId: Array<ObjectId>;
  aMatchLeagueCashback: Array<matchLeaugeCashBackInterface>;
  nTeams: number;
  nJoinedLeague: number;
  nWinnings: number;
  aMatchLeagueWins: Array<MatchLeaugeWinsInterface>;
  aExtraWin: Array<ExtraWin>;
  nBonusWin: number;
  iMatchId: ObjectId;
  eCategory: CategoryTypeEnums;
  eMatchStatus: MatchStatus;
  dStartDate: Date;
  sExternalId: string;

  createdAt?: Date;
  updatedAt?: Date;
}
