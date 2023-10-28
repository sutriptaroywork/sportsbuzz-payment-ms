import { Schema, model } from "mongoose";
import { RankTypeEnums } from "@/enums/rankTypeEnums/rankTypeEnums";
import FilterCategoryModel from "../filterCategoryModel/filterCategoryModel";
import LeagueCategoryModel from "../leagueCategoryModel/leagueCategoryModel";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { CashbackTypeEnums } from "@/enums/cashbackTypeEnums/cashbackTypeEnums";
import { MatchStatus } from "@/enums/matchStatus/matchStatus";
import UserModel from "../userModel/userModel";
import MatchModel from "../matchModel/matchModel";
import LeagueModel from "../leagueModel/leagueModel";
import { MatchLeagueAttributes } from "@/interfaces/matchLeague/matchLeagueInterface";
import { GamesDBConnect } from "@/connections/database/mongodb/mongodb";

export interface MatchLeagueModelInput extends Omit<MatchLeagueAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface MatchLeagueModelOutput extends Required<MatchLeagueAttributes> {}

const MatchLeagueSchema = new Schema<MatchLeagueAttributes>(
  {
    iMatchId: {
      type: Schema.Types.ObjectId,
      ref: MatchModel,
      index: true,
    },
    iLeagueId: {
      type: Schema.Types.ObjectId,
      ref: LeagueModel,
    },
    iLeagueCatId: {
      type: Schema.Types.ObjectId,
      ref: LeagueCategoryModel,
    },
    iFilterCatId: {
      type: Schema.Types.ObjectId,
      ref: FilterCategoryModel,
    },
    sShareLink: {
      type: String,
      trim: true,
    },
    sName: {
      type: String,
      trim: true,
      required: true,
    },
    nMax: {
      type: Number,
      required: true,
    },
    nMin: {
      type: Number,
      required: true,
    },
    nPrice: {
      type: Number,
    },
    nTotalPayout: {
      type: Number,
    },
    nDeductPercent: {
      type: Number,
    },
    nBonusUtil: {
      type: Number,
    },
    aLeaguePrize: [
      {
        nRankFrom: {
          type: Number,
        },
        nRankTo: {
          type: Number,
        },
        nPrize: {
          type: Number,
        },
        eRankType: {
          type: String,
          enum: RankTypeEnums,
          default: RankTypeEnums.REAL_MONEY,
        }, // R = REAL_MONEY, B = BONUS, E = EXTRA
        sInfo: {
          type: String,
        },
        sImage: {
          type: String,
          trim: true,
        },
      },
    ],
    sLeagueCategory: {
      type: String,
    },
    sFilterCategory: {
      type: String,
    },
    sPayoutBreakupDesign: {
      type: String,
    },
    bConfirmLeague: {
      type: Boolean,
      default: false,
    },
    bMultipleEntry: {
      type: Boolean,
      default: false,
    },
    bAutoCreate: {
      type: Boolean,
      default: false,
    },
    bCancelled: {
      type: Boolean,
      default: false,
    },
    bPoolPrize: {
      type: Boolean,
      default: false,
    },
    bUnlimitedJoin: {
      type: Boolean,
      default: false,
    },
    bCopyLeague: {
      type: Boolean,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    nPosition: {
      type: Number,
    },
    nLeaguePrice: {
      type: Number,
    },
    bPrizeDone: {
      type: Boolean,
      default: false,
    },
    bWinningDone: {
      type: Boolean,
      default: false,
    },
    nWinnersCount: {
      type: Number,
    },
    nTeamJoinLimit: {
      type: Number,
      default: 1,
    },
    nJoined: {
      type: Number,
      default: 0,
    },
    iUserId: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
    },
    bPrivateLeague: {
      type: Boolean,
      default: false,
    },
    sFairPlay: {
      type: String,
    },
    nAdminCommission: {
      type: Number,
    },
    nCreatorBonusGst: {
      type: Number,
      default: 0,
    },
    nCreatorCommission: {
      type: Number,
    },
    nLoyaltyPoint: {
      type: Number,
      default: 0,
    },
    bCashbackEnabled: {
      type: Boolean,
      default: false,
    },
    nMinCashbackTeam: {
      type: Number,
      default: 0,
    },
    nCashbackAmount: {
      type: Number,
    },
    eCashbackType: {
      type: String,
      enum: CashbackTypeEnums,
      default: CashbackTypeEnums.BONUS,
      nullable: true,
    }, // C = CASH, B = BONUS
    bIsProcessed: {
      type: Boolean,
      default: false,
    },
    sShareCode: {
      type: String,
    },
    dCreatedAt: {
      type: Date,
      default: Date.now,
    },
    dUpdatedAt: {
      type: Date,
    },
    bInternalLeague: {
      type: Boolean,
      default: false,
    },
    nMinTeamCount: {
      type: Number,
    },
    nBotsCount: {
      type: Number,
    },
    nCopyBotsPerTeam: {
      type: Number,
    },
    eMatchStatus: {
      type: String,
      enum: MatchStatus,
      default: MatchStatus.PENDING,
    },
    bBotCreate: {
      type: Boolean,
      default: false,
    },
    bCopyBotInit: {
      type: Boolean,
      default: false,
    },
    sExternalId: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" },
  },
);

const MatchLeagueModel = GamesDBConnect.model("matchleagues", MatchLeagueSchema);

export default MatchLeagueModel;
