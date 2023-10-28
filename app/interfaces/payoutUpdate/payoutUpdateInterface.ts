import { payoutOptionEnums } from "@/enums/payoutOptionEnums/payoutOption";
import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";
import { payoutOptionOutput } from "@/models/payoutOptionModel/payoutOptionModel";

export default interface payoutUpdateInterface {
  id: string;
  sTitle: string;
  sImage: string;
  eKey: payoutOptionEnums;
  sInfo: string;
  nWithdrawFee: number;
  nMinAmount: number;
  nMaxAmount: number;
}

export interface payoutUpdateResponse extends defaultResponseInterface {
  data: payoutOptionOutput
}
