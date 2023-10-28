import { Schema, ObjectId } from "mongoose";
import { BotLogsTypeEnums } from "@/enums/botLogTypeEnums/botLogTypeEnums";
import * as MatchModel from "../matchModel/matchModel";
import * as MatchLeagueModel from "../adminModel/adminModel";
import { GamesDBConnect } from "@/connections/database/mongodb/mongodb";
import { BotLogAttributes } from "@/interfaces/botLog/botLog";

export interface BotLogModelInput extends Omit<BotLogAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface BotLogModelOutput extends Required<BotLogAttributes> {}

const BotLogSchema = new Schema<BotLogAttributes>(
  {
    iMatchId: {
      type: Schema.Types.ObjectId,
      ref: MatchModel.default,
      index: true,
    },
    iMatchLeagueId: {
      type: Schema.Types.ObjectId,
      ref: MatchLeagueModel.default,
      index: true,
    },
    nTeams: {
      type: Number,
    },
    nSuccess: {
      type: Number,
      default: 0,
    },
    nErrors: {
      type: Number,
      default: 0,
    },
    nReplaces: {
      type: Number,
      default: 0,
    },
    bInstantAdd: {
      type: Boolean,
      default: false,
    },
    eType: {
      type: String,
      enum: BotLogsTypeEnums,
      default: BotLogsTypeEnums.USER,
    },
    iAdminId: {
      type: Schema.Types.ObjectId,
    },
    aError: [
      {
        type: Object,
      },
    ],
    nPopCount: {
      type: Number,
      default: 0,
    },
    nJoinSubmitCount: {
      type: Number,
      default: 0,
    },
    nTeamCreated: {
      type: Number,
      default: 0,
    },
    aBaseTeams: {
      type: Array,
    },
    aExtraError: [
      {
        type: Object,
      },
    ],
  },
  {
    timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" },
  },
);

const BotLogModel = GamesDBConnect.model("botlogs", BotLogSchema);

export default BotLogModel;
