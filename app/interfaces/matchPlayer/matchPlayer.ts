import { PlayerRoleEnums } from "@/enums/matchPlayerEnums/matchPlayerEnums";
import { ObjectId } from "mongodb";

export interface MatchPlayerAttributes {
  _id: ObjectId;
  sKey: string;
  iMatchId: ObjectId; // pak match ni id
  iTeamId: ObjectId; // ind
  sTeamName: string;
  iPlayerId: ObjectId; // jjj
  sImage: string;
  sName: string;
  sTeamKey: string;
  eRole: PlayerRoleEnums;
  nFantasyCredit: number;
  nScoredPoints: number; // 9
  nSeasonPoints: number;
  aPointBreakup: Array<{
    sKey: string;
    sName: string;
    nPoint: number;
    nScoredPoints: number;
  }>;
  nSetBy: number;
  nCaptainBy: number;
  nViceCaptainBy: number;
  bShow: boolean;
  dUpdatedAt: Date;
  dCreatedAt: Date;
  sExternalId: string;

  createdAt?: Date;
  updatedAt?: Date;
}
