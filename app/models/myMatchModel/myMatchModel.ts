import { Schema } from "mongoose";
import UserModel from "../userModel/userModel";
import MatchModel from "../matchModel/matchModel";
import { GamesDBConnect } from "@/connections/database/mongodb/mongodb";
import { MatchStatus } from "@/enums/matchStatus/matchStatus";
import UserLeagueModel from "../userLeagueModel/userLeagueModel";
import MatchLeagueModel from "../matchLeagueModel/matchLeagueModel";
import { MyMatchAttributes } from "@/interfaces/myMatch/myMatchInterface";
import { CashbackTypeEnums } from "@/enums/cashbackTypeEnums/cashbackTypeEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";

export interface MyMatchModelInput extends Omit<MyMatchAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface MyMatchModelOutput extends Required<MyMatchAttributes> {}

const MyMatchSchema = new Schema<MyMatchAttributes>(
  {
    iUserId: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
    },
    aMatchLeagueId: [
      {
        type: Schema.Types.ObjectId,
        ref: MatchLeagueModel,
        default: [],
      },
    ],
    aCMatchLeagueId: [
      {
        type: Schema.Types.ObjectId,
        ref: MatchLeagueModel,
        default: [],
      },
    ],
    aMatchLeagueCashback: [
      {
        iMatchLeagueId: {
          type: Schema.Types.ObjectId,
          ref: MatchLeagueModel,
        },
        nAmount: {
          type: Number,
        },
        nTeams: {
          type: Number,
        },
        eType: {
          type: String,
          enum: CashbackTypeEnums,
        },
      },
    ],
    nTeams: {
      type: Number,
    },
    nJoinedLeague: {
      type: Number,
    },
    nWinnings: {
      type: Number,
      default: 0,
    },
    aMatchLeagueWins: [
      {
        iMatchLeagueId: {
          type: Schema.Types.ObjectId,
          ref: MatchLeagueModel,
        },
        iUserLeagueId: {
          type: Schema.Types.ObjectId,
          ref: UserLeagueModel,
        },
        nRealCash: {
          type: Number,
        },
        nBonus: {
          type: Number,
        },
        aExtraWin: [
          {
            sInfo: {
              type: String,
            },
            sImage: {
              type: String,
              trim: true,
            },
          },
        ],
      },
    ],
    aExtraWin: [
      {
        sInfo: {
          type: String,
        },
        sImage: {
          type: String,
          trim: true,
        },
      },
    ],
    nBonusWin: {
      type: Number,
      default: 0,
    },
    iMatchId: {
      type: Schema.Types.ObjectId,
      ref: MatchModel,
      required: true,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    eMatchStatus: {
      type: String,
      enum: MatchStatus,
      default: MatchStatus.UPCOMING,
    },
    dStartDate: {
      type: Date,
      required: true,
    },
    sExternalId: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const MyMatchModel = GamesDBConnect.model("mymatches", MyMatchSchema);

export default MyMatchModel;
