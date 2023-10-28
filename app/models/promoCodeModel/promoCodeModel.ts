import { Schema } from "mongoose";
import MatchModel from "../matchModel/matchModel";
import LeagueModel from "../leagueModel/leagueModel";
import { LeaguesDBConnect } from "@/connections/database/mongodb/mongodb";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { PromoCodeTypesEnums } from "@/enums/promoCodeTypeEnums/promoCodeTypeEnums";
import { PromoCodeAttributes } from "@/interfaces/promoCode/promoCodeInterface";

export interface PromoCodeModelInput extends Omit<PromoCodeAttributes, "_id" | "updatedAt" | "createdAt"> {}
export interface PromoCodeModelOutput extends Required<PromoCodeAttributes> {}

const PromoCodeSchema = new Schema<PromoCodeAttributes>(
  {
    sName: {
      type: String,
      required: true,
    },
    sCode: {
      type: String,
      required: true,
    },
    sInfo: {
      type: String,
      trim: true,
    },
    bIsPercent: {
      type: Boolean,
      default: false,
    },
    nAmount: {
      type: Number,
    },
    bShow: {
      type: Boolean,
      default: false,
    }, // if eStatus is Y and this flag is false, no need to show in front, but it's active for users.
    // for e.g.: there is any social media campaign run by marketing team and users whoever has seen the post, that user can apply PromoCode from their post to this platform.
    eStatus: {
      type: String,
      enum: StatusTypeEnums,
      default: StatusTypeEnums.NO,
    }, // Y = Active(YES), N = Inactive(NO).
    nMinAmount: {
      type: Number,
    },
    nMaxAmount: {
      type: Number,
    },
    aLeagues: [
      {
        type: Schema.Types.ObjectId,
        ref: LeagueModel,
      },
    ],
    aMatches: [
      {
        type: Schema.Types.ObjectId,
        ref: MatchModel,
      },
    ],
    eType: {
      type: String,
      enum: PromoCodeTypesEnums,
      default: PromoCodeTypesEnums.DEPOSIT,
    },
    nMaxAllow: {
      type: Number,
    },
    bMaxAllowForAllUser: {
      type: Boolean,
      default: false,
    }, // PromoCode to be used Only N number of times by all the users so that i can generated limited use PromoCode
    nPerUserUsage: {
      type: Number,
      default: 1,
    },
    dStartTime: {
      type: Date,
    },
    dExpireTime: {
      type: Date,
    },
    nBonusExpireDays: {
      type: Number,
    },
    sExternalId: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const PromoCodeModel = LeaguesDBConnect.model("promocodes", PromoCodeSchema);

export default PromoCodeModel;
