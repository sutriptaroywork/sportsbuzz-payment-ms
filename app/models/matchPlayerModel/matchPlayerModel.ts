import { Schema } from "mongoose";
import * as TeamModel from "../teamModel/teamModel";
import * as MatchModel from "../matchModel/matchModel";
import { MatchDBConnect } from "@/connections/database/mongodb/mongodb";
import { MatchPlayerAttributes } from "@/interfaces/matchPlayer/matchPlayer";
import { PlayerRoleEnums } from "@/enums/matchPlayerEnums/matchPlayerEnums";
import * as PlayerModel from "../PlayerModel/PlayerModel";

export interface MatchPlayerModelInput extends Omit<MatchPlayerAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface MatchPlayerModelOutput extends Required<MatchPlayerAttributes> {}

const MatchPlayerSchema = new Schema<MatchPlayerAttributes>(
  {
    sKey: {
      type: String,
      trim: true,
    },
    iMatchId: {
      type: Schema.Types.ObjectId,
      ref: MatchModel.default,
      index: true,
    }, // pak match ni id
    iTeamId: {
      type: Schema.Types.ObjectId,
      ref: TeamModel.default,
    }, // ind
    sTeamName: {
      type: String,
      trim: true,
    },
    iPlayerId: {
      type: Schema.Types.ObjectId,
      ref: PlayerModel.default,
    }, // jjj
    sImage: {
      type: String,
      trim: true,
    },
    sName: {
      type: String,
      trim: true,
    },
    sTeamKey: {
      type: String,
      trim: true,
    },
    eRole: {
      type: String,
      enum: PlayerRoleEnums,
      default: PlayerRoleEnums.BATSMAN,
    },
    nFantasyCredit: {
      type: Number,
      default: 9,
    },
    nScoredPoints: {
      type: Number,
      default: 0,
    }, // 9
    nSeasonPoints: {
      type: Number,
      default: 0,
    },
    aPointBreakup: [
      {
        sKey: {
          type: String,
          trim: true,
        },
        sName: {
          type: String,
          trim: true,
        },
        nPoint: {
          type: Number,
        },
        nScoredPoints: {
          type: Number,
          default: 0,
        },
      },
    ],
    nSetBy: {
      type: Number,
      default: 0,
    },
    nCaptainBy: {
      type: Number,
      default: 0,
    },
    nViceCaptainBy: {
      type: Number,
      default: 0,
    },
    bShow: {
      type: Boolean,
      default: false,
    },
    dUpdatedAt: {
      type: Date,
    },
    dCreatedAt: {
      type: Date,
      default: Date.now,
    },
    sExternalId: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" },
  },
);

const MatchPlayerModel = MatchDBConnect.model("matchPlayers", MatchPlayerSchema);

export default MatchPlayerModel;
