import { Schema } from "mongoose";
import UserModel from "../userModel/userModel";
import MatchModel from "../matchModel/matchModel";
import UserTeamModel from "../userTeamModel/userTeamModel";
import PromoCodeModel from "../promoCodeModel/promoCodeModel";
import { GamesDBConnect } from "@/connections/database/mongodb/mongodb";
import MatchLeagueModel from "../matchLeagueModel/matchLeagueModel";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { UserLeagueAttributes } from "@/interfaces/userLeague/userLeagueInterface";

export interface UserLeagueModelInput extends Omit<UserLeagueAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface UserLeagueModelOutput extends Required<UserLeagueAttributes> {}

const UserLeagueSchema = new Schema<UserLeagueAttributes>(
  {
    iUserTeamId: {
      type: Schema.Types.ObjectId,
      ref: UserTeamModel,
    },
    iUserId: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
    },
    iMatchLeagueId: {
      type: Schema.Types.ObjectId,
      ref: MatchLeagueModel,
    },
    iMatchId: {
      type: Schema.Types.ObjectId,
      ref: MatchModel,
    },
    nTotalPayout: {
      type: Number,
    },
    nPoolPrice: {
      type: Boolean,
      default: false,
    },
    nTotalPoints: {
      type: Number,
    },
    sPayoutBreakupDesign: {
      type: String,
    },
    nRank: {
      type: Number,
    },
    nPrice: {
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
    nBonusWin: {
      type: Number,
      default: 0,
    },
    sUserName: {
      type: String,
      trim: true,
    },
    eType: {
      type: String,
      enum: UserTypeEnums,
      default: UserTypeEnums.USER,
    },
    sProPic: {
      type: String,
      trim: true,
    },
    sTeamName: {
      type: String,
      trim: true,
    },
    sMatchName: {
      type: String,
      trim: true,
    },
    sLeagueName: {
      type: String,
      trim: true,
    },
    ePlatform: {
      type: String,
      enum: PlatformTypesEnums,
      required: true,
      default: PlatformTypesEnums.OTHER,
    },
    iPromocodeId: {
      type: Schema.Types.ObjectId,
      ref: PromoCodeModel,
    },
    nPromoDiscount: {
      type: Number,
    },
    nOriginalPrice: {
      type: Number,
    },
    nPricePaid: {
      type: Number,
    },
    actualCashUsed: {
      type: Number,
    },
    actualBonusUsed: {
      type: Number,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    bPointCalculated: {
      type: Boolean,
      default: false,
    },
    bRankCalculated: {
      type: Boolean,
      default: false,
    },
    bPrizeCalculated: {
      type: Boolean,
      default: false,
    },
    bWinDistributed: {
      type: Boolean,
      default: false,
    },
    sExternalId: {
      type: String,
    },
    bCancelled: {
      type: Boolean,
      default: false,
    },
    bSwapped: {
      type: Boolean,
      default: false,
    },
    bIsDuplicated: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const UserLeagueModel = GamesDBConnect.model("userleagues", UserLeagueSchema);

export default UserLeagueModel;
