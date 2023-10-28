import { ObjectId } from "mongodb";
import { BotLogsTypeEnums } from "@/enums/botLogTypeEnums/botLogTypeEnums";

export interface BotLogAttributes {
  iMatchId: ObjectId;
  iMatchLeagueId: ObjectId;
  nTeams: number;
  nSuccess: number;
  nErrors: number;
  nReplaces: number;
  bInstantAdd: boolean;
  eType: BotLogsTypeEnums;
  iAdminId: ObjectId;
  aError: Array<any>;
  nPopCount: number;
  nJoinSubmitCount: number;
  nTeamCreated: number;
  aBaseTeams: any;
  aExtraError: Array<Object>;

  createdAt?: Date;
  updatedAt?: Date;
}
