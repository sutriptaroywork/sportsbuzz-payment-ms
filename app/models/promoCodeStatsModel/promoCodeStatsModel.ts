import { Schema, ObjectId } from "mongoose";
import UserModel from "../userModel/userModel";
import MatchModel from "../matchModel/matchModel";
import PromoCodeModel from "../promoCodeModel/promoCodeModel";
import { LeaguesDBConnect } from "@/connections/database/mongodb/mongodb";
import UserLeagueModel from "../userLeagueModel/userLeagueModel";
import MatchLeagueModel from "../matchLeagueModel/matchLeagueModel";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { PromoCodeStatisticAttributes } from "@/interfaces/promoCodeStatistics/promoCodeStatsInterface";

export interface PromoCodeStatisticModelInput
  extends Omit<
    PromoCodeStatisticAttributes,
    "_id" | "createdAt" | "updatedAt" | "iMatchId" | "iMatchLeagueId" | "iUserLeagueId" | "eStatus" | "sExternalId"
  > {}
export interface PromoCodeStatisticModelOutput extends Required<PromoCodeStatisticAttributes> {}

const PromoCodeStatisticSchema = new Schema<PromoCodeStatisticAttributes>(
  {
    iPromocodeId: {
      type: Schema.Types.ObjectId,
      ref: PromoCodeModel,
      required: true,
    },
    iUserId: {
      type: Schema.Types.ObjectId,
      ref: UserModel,
      required: true,
    },
    idepositId: {
      type: Number,
    },
    nAmount: {
      type: Number,
    },
    sTransactionType: {
      type: String,
    },
    iMatchId: {
      type: Schema.Types.ObjectId,
      ref: MatchModel,
    },
    iMatchLeagueId: {
      type: Schema.Types.ObjectId,
      ref: MatchLeagueModel,
    },
    iUserLeagueId: {
      type: Schema.Types.ObjectId,
      ref: UserLeagueModel,
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
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const PromocodeStatisticModel = LeaguesDBConnect.model("Promocodestatistics", PromoCodeStatisticSchema);

export default PromocodeStatisticModel;
