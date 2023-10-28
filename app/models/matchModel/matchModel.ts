import { Schema } from "mongoose";
import TeamModel from "../teamModel/teamModel";
import SeasonModel from "../seasonModel/seasonModel";
import { MatchDBConnect } from "@/connections/database/mongodb/mongodb";
import { MatchAttributes } from "@/interfaces/match/matchInterface";
import { FormatTypesEnums } from "@/enums/formatTypeEnums/formatTypesEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import SeriesLeaderBoardModel from "../seriesLeaderBoardModel/seriesLeaderBoardModel";
import { MatchStatusTypeEnums } from "@/enums/matchStatusTypeEnums/matchStatusTypeEnums";
import { MatchProviderTypesEnums } from "@/enums/matchProviderTypesEnums/matchProviderTypeEnums";
import { MatchTossWinnerActionTypeEnums } from "@/enums/matchTossWinnerActTypesEnums/matchTossWinnerActTypesEnums";

export interface MatchModelInput extends Omit<MatchAttributes, "_id" | "updatedAt" | "createdAt"> {}
export interface MatchModelOutput extends Required<MatchAttributes> {}

const MatchSchema = new Schema<MatchAttributes>(
  {
    sKey: {
      type: String,
      trim: true,
    },
    eFormat: {
      type: String,
      enum: FormatTypesEnums,
    },
    sName: {
      type: String,
      trim: true,
    },
    sSponsoredText: {
      type: String,
      trim: true,
    },
    sSeasonKey: {
      type: String,
      trim: true,
    },
    sVenue: {
      type: String,
      trim: true,
    },
    eStatus: {
      type: String,
      enum: MatchStatusTypeEnums,
      default: MatchStatusTypeEnums.P,
    },
    dStartDate: {
      type: Date,
      required: true,
    },
    oHomeTeam: {
      iTeamId: {
        type: Schema.Types.ObjectId,
        ref: TeamModel,
      },
      sKey: {
        type: String,
        trim: true,
        required: true,
      },
      sName: {
        type: String,
        trim: true,
      },
      sShortName: {
        type: String,
      },
      sImage: {
        type: String,
        trim: true,
      },
      nScore: {
        type: String,
      },
    },
    oAwayTeam: {
      iTeamId: {
        type: Schema.Types.ObjectId,
        ref: TeamModel,
      },
      sKey: {
        type: String,
        trim: true,
        required: true,
      },
      sName: {
        type: String,
        trim: true,
      },
      sShortName: {
        type: String,
      },
      sImage: {
        type: String,
        trim: true,
      },
      nScore: {
        type: String,
      },
    },
    sWinning: {
      type: String,
    },
    iTossWinnerId: {
      type: Schema.Types.ObjectId,
      ref: TeamModel,
    },
    eTossWinnerAction: {
      type: String,
      enum: MatchTossWinnerActionTypeEnums,
    },
    bMatchOnTop: {
      type: Boolean,
      default: false,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    sInfo: {
      type: String,
      trim: true,
    },
    nLatestInningNumber: {
      type: Number,
    },
    aPlayerRole: [
      {
        sName: {
          type: String,
          trim: true,
          required: true,
        },
        sFullName: {
          type: String,
          trim: true,
        },
        nMax: {
          type: Number,
          required: true,
        },
        nMin: {
          type: Number,
          required: true,
        },
        nPosition: {
          type: Number,
        },
      },
    ],
    bScorecardShow: {
      type: Boolean,
      default: false,
    },
    sLeagueText: {
      type: String,
    },
    sSeasonName: {
      type: String,
      trim: true,
    },
    nMaxTeamLimit: {
      type: Number,
    },
    iSeriesId: {
      type: Schema.Types.ObjectId,
      ref: SeriesLeaderBoardModel,
    },
    iSeasonId: {
      type: Schema.Types.ObjectId,
      ref: SeasonModel,
    },
    bDisabled: {
      type: Boolean,
      default: false,
    },
    eProvider: {
      type: String,
      enum: MatchProviderTypesEnums,
      default: MatchProviderTypesEnums.CUSTOM,
    },
    bLineupsOut: {
      type: Boolean,
      default: false,
    },
    sFantasyPost: {
      type: String,
    },
    sStreamUrl: {
      type: String,
      trim: true,
    },
    nRankCount: {
      type: Number,
      default: 0,
    },
    nPrizeCount: {
      type: Number,
      default: 0,
    },
    nWinDistCount: {
      type: Number,
      default: 0,
    },
    dWinDistAt: {
      type: Date,
    },
    sStatusNote: {
      type: String,
    },
    sExternalId: {
      type: String,
    },
    nPrice: {
      type: Schema.Types.Number,
      default: 0,
    },
    isMegaContest: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const MatchModel = MatchDBConnect.model("matches", MatchSchema);

export default MatchModel;
