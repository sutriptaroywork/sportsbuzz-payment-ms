import { RankTypeEnums } from "@/enums/rankTypeEnums/rankTypeEnums";

export interface PrizeBreakupInterface {
  nRankFrom: number;
  nRankTo: number;
  nPrize: string;
  sInfo: string;
  sImage: string;
  eRankType: RankTypeEnums;
}
