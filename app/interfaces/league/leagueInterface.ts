import { ObjectId } from "mongodb";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { LeaguePrizeInterface } from "../leaguePrize/leaguePrizeInterface";
import { CashbackTypeEnums } from "@/enums/cashbackTypeEnums/cashbackTypeEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";

export interface LeagueAttributes {
  _id: ObjectId;
  sName: string;
  nMax: number;
  nMin: number;
  nPrice: number;
  nTotalPayout: number;
  nDeductPercent: number;
  nBonusUtil: number;
  aLeaguePrize: Array<LeaguePrizeInterface>;
  nTotalWinners: number;
  sPayoutBreakupDesign: string;
  bConfirmLeague: boolean;
  bMultipleEntry: boolean;
  bAutoCreate: boolean;
  bPoolPrize: boolean;
  bUnlimitedJoin: boolean;
  nPosition: number;
  nTeamJoinLimit: number;
  nWinnersCount: number;
  eStatus: StatusTypeEnums;
  eCategory: CategoryTypeEnums;
  sLeagueCategory: string;
  nLoyaltyPoint: number;
  sFilterCategory: string;
  nMinCashbackTeam: number;
  nCashbackAmount: number;
  bCashbackEnabled: boolean;
  eCashbackType: CashbackTypeEnums;
  iLeagueCatId: ObjectId;
  iFilterCatId: ObjectId;
  nMinTeamCount: number;
  nBotsCount: number;
  nCopyBotsPerTeam: number;
  bBotCreate: boolean;
  bCopyBotInit: boolean;
  nSameCopyBotTeam: number;
  nAutoFillSpots: number;
  sExternalId: string;

  createdAt: Date;
  updatedAt: Date;
}
