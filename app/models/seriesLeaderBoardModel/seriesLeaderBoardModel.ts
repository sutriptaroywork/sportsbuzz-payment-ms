import { Schema } from "mongoose";
import { SeriesLBDBConnect } from "@/connections/database/mongodb/mongodb";
import { RankTypeEnums } from "@/enums/rankTypeEnums/rankTypeEnums";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { SeriesStatusTypeEnums } from "@/enums/seriesStatusTypeEnums/seriesStatusTypeEnums";
import { SeriesLeaderBoardAttributes } from "@/interfaces/seriesLeaderBoard/seriesLeaderBoardInterface";
import SeriesLBCategoriesTemplateModel from "../seriesLBCategoriesTemplateModel/seriesLBCategoriesTemplateModel";
import { SeriesLBCategoriesTemplateTypeEnums } from "@/enums/seriesLBCategoriesTemplateTypeEnums/seriesLBCategoriesTemplateTypeEnums";

export interface SeriesLeaderBoardModelInput
  extends Omit<SeriesLeaderBoardAttributes, "_id" | "updatedAt" | "createdAt"> {}
export interface SeriesLeaderBoardModelOutput extends Required<SeriesLeaderBoardAttributes> {}

const SeriesLeaderBoardSchema = new Schema<SeriesLeaderBoardAttributes>(
  {
    sName: {
      type: String,
      required: true,
    },
    sKey: {
      type: String,
      required: true,
    },
    sInfo: {
      type: String,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    eStatus: {
      type: String,
      enum: SeriesStatusTypeEnums,
      default: SeriesStatusTypeEnums.P,
    },
    aSeriesCategory: [
      {
        sName: {
          type: String,
          required: true,
        },
        eType: {
          type: String,
          enum: SeriesLBCategoriesTemplateTypeEnums,
          default: SeriesLBCategoriesTemplateTypeEnums.CONTEST_JOIN,
        },
        sInfo: {
          type: String,
        },
        sImage: {
          type: String,
        },
        sColumnText: {
          type: String,
        },
        iCategoryId: {
          type: Schema.Types.ObjectId,
          ref: SeriesLBCategoriesTemplateModel,
        },
        sFirstPrize: {
          type: String,
        },
        aPrizeBreakup: [
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
        sContent: {
          type: String,
        },
        nMaxRank: {
          type: Number,
        },
        nTotalPayout: {
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
        eStatus: {
          type: String,
          enum: StatusTypeEnums,
          default: StatusTypeEnums.YES,
        },
        sExternalId: {
          type: String,
        },
      },
    ],
    dWinDistributedAt: {
      type: Date,
    },
    bPriceDone: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const SeriesLeaderBoardModel = SeriesLBDBConnect.model("seriesleaderboards", SeriesLeaderBoardSchema);

export default SeriesLeaderBoardModel;
