import { CashbackTypeEnums } from "@/enums/cashbackTypeEnums/cashbackTypeEnums";
import { ObjectId } from "mongoose";

export interface matchLeaugeCashBackInterface {
  iMatchLeagueId: ObjectId;
  nAmount: number;
  nTeams: number;
  eType: CashbackTypeEnums;
}
