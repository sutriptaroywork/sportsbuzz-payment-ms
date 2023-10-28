import { payoutStatusEnums } from "@/enums/payoutStatusEnums/payoutStatusEnums";
import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";
import { payoutOptionOutput } from "@/models/payoutOptionModel/payoutOptionModel";

export default interface payoutPayloadInterface {
  ePaymentStatus: payoutStatusEnums;
  reject_reason: string;
}

export interface adminPayoutOptionsListInterface {
  start: string; limit: string; sort: string; search: string
}

export interface payoutOptionsList {
  total: number, results: payoutOptionOutput 
}
export interface adminPayoutOptionsListResponse extends defaultResponseInterface {
  data: payoutOptionsList[]
}