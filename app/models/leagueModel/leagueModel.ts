import { Schema } from "mongoose";
import { LeaguesDBConnect } from "@/connections/database/mongodb/mongodb";
import { RankTypeEnums } from "@/enums/rankTypeEnums/rankTypeEnums";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import LeagueCategoryModel from "../leagueCategoryModel/leagueCategoryModel";
import FilterCategoryModel from "../filterCategoryModel/filterCategoryModel";
import { CashbackTypeEnums } from "@/enums/cashbackTypeEnums/cashbackTypeEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { LeagueCategoryAttributes } from "@/interfaces/leagueCategory/leagueCategoryInterface";
import { LeagueAttributes } from "@/interfaces/league/leagueInterface";

export interface LeagueModelInput extends Omit<LeagueAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface LeagueModelOutput extends Required<LeagueCategoryAttributes> {}

const LeagueSchema = new Schema<LeagueAttributes>(
  {
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
      required: true,
    },
    nTotalPayout: {
      type: Number,
      required: true,
    },
    nDeductPercent: {
      type: Number,
    },
    nBonusUtil: {
      type: Number,
      default: 0,
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
    nTotalWinners: {
      type: Number,
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
    bPoolPrize: {
      type: Boolean,
      default: false,
    },
    bUnlimitedJoin: {
      type: Boolean,
      default: false,
    },
    nPosition: {
      type: Number,
    },
    nTeamJoinLimit: {
      type: Number,
      default: 1,
    },
    nWinnersCount: {
      type: Number,
    },
    eStatus: {
      type: String,
      enum: StatusTypeEnums,
      default: StatusTypeEnums.NO,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    sLeagueCategory: {
      type: String,
    },
    nLoyaltyPoint: {
      type: Number,
      default: 0,
    },
    sFilterCategory: {
      type: String,
    },
    nMinCashbackTeam: {
      type: Number,
      default: 0,
    },
    nCashbackAmount: {
      type: Number,
    },
    bCashbackEnabled: {
      type: Boolean,
      default: false,
    },
    eCashbackType: {
      type: String,
      enum: CashbackTypeEnums,
      default: CashbackTypeEnums.BONUS,
    }, // C = CASH, B = BONUS
    iLeagueCatId: {
      type: Schema.Types.ObjectId,
      ref: LeagueCategoryModel,
      required: true,
    },
    iFilterCatId: {
      type: Schema.Types.ObjectId,
      ref: FilterCategoryModel,
      required: true,
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
    bBotCreate: {
      type: Boolean,
      default: false,
    },
    bCopyBotInit: {
      type: Boolean,
      default: false,
    },
    nSameCopyBotTeam: {
      type: Number,
    },
    nAutoFillSpots: {
      type: Number,
      default: 0,
    },
    sExternalId: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const LeagueModel = LeaguesDBConnect.model("leagues", LeagueSchema);

export default LeagueModel;
