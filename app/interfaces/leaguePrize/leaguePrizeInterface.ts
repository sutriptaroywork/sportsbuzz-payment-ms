import { RankTypeEnums } from "@/enums/rankTypeEnums/rankTypeEnums";

export interface LeaguePrizeInterface {
  RankFrom: number;
  RankTo: number;
  Prize: number;
  RankType: RankTypeEnums;
  Info: string;
  Image: string;
}
