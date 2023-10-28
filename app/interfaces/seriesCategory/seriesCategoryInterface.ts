import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { PrizeBreakupInterface } from "../prizeBreakup/prizeBreakupInterface";

export interface SeriesCategoryInterface {
  sName: string;
  eType: string;
  sInfo: string;
  sImage: string;
  sColumnText: string;
  iCategoryId: string;
  sFirstPrize: string;
  aPrizeBreakup: PrizeBreakupInterface;
  sContent: string;
  nMaxRank: number;
  nTotalPayout: number;
  bPrizeDone: boolean;
  bWinningDone: boolean;
  eStatus: StatusTypeEnums;
  sExternalId: string;
}
