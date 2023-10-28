import { RewardOnEnums } from "@/enums/rewardOnEnums/rewardOnEnums";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { CommonRuleEnums } from "@/enums/commonRuleEnums/commonRuleEnums";
import { CashbackTypeEnums } from "@/enums/cashbackTypeEnums/cashbackTypeEnums";

export interface CommonRuleAttributes {
  eRule: CommonRuleEnums;
  sRuleName: string;
  sDescription: string;
  nAmount: number;
  eType: CashbackTypeEnums;
  nMax: number;
  nMin: number;
  eStatus: StatusTypeEnums;
  nExpireDays: number;
  sExternalId: string;
  sRewardOn: RewardOnEnums;

  createdAt?: Date;
  updatedAt?: Date;
}
