import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import { Transaction } from "sequelize";

export interface DistributeReferralBonusPayload {
    iUserId: string; t: Transaction; updateDepositResult: UserDepositOutput
}