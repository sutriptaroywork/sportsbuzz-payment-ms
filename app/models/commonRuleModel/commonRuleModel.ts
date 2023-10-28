import { Schema } from "mongoose";
import { StatisticsDBConnect } from "@/connections/database/mongodb/mongodb";
import { RewardOnEnums } from "@/enums/rewardOnEnums/rewardOnEnums";
import { CommonRuleEnums } from "@/enums/commonRuleEnums/commonRuleEnums";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { CashbackTypeEnums } from "@/enums/cashbackTypeEnums/cashbackTypeEnums";
import { CommonRuleAttributes } from "@/interfaces/commonRule/commonRuleInterface";

export interface CommonRuleModelInput extends Omit<CommonRuleAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface CommonRuleModelOutput extends Required<CommonRuleAttributes> {}

const CommonRuleSchema = new Schema<CommonRuleAttributes>(
  {
    eRule: {
      type: String,
      enum: CommonRuleEnums,
      required: true,
      unique: true,
    },
    sRuleName: {
      type: String,
    },
    sDescription: {
      type: String,
    },
    nAmount: {
      type: Number,
      required: true,
    },
    eType: {
      type: String,
      enum: CashbackTypeEnums,
      required: true,
    },
    nMax: {
      type: Number,
    },
    nMin: {
      type: Number,
    },
    eStatus: {
      type: String,
      enum: StatusTypeEnums,
      default: StatusTypeEnums.NO,
    },
    nExpireDays: {
      type: Number,
    },
    sExternalId: {
      type: String,
    },
    sRewardOn: {
      type: String,
      enum: RewardOnEnums,
    },
  },
  {
    timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" },
  },
);

const CommonRuleModel = StatisticsDBConnect.model("commonrules", CommonRuleSchema);

export default CommonRuleModel;
