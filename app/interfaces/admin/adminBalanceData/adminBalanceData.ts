import { StatisticModelOutput } from "@/models/statisticsModel/statisticsModel";
import { UserBalanceOutput } from "@/models/userBalanceModel/userBalanceModel";

export interface AdminBalanceData extends UserBalanceOutput, StatisticModelOutput {
  nTotalPlayCash: number;
}

export interface AdminBalanceDataOutput extends Omit<AdminBalanceData, "aTotalMatch" | "nTotalPlayedCash"> {}
