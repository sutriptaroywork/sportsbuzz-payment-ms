import { StatusCodeEnums } from "@/enums/commonEnum/commonEnum";
import { paymentOptionOutput } from "@/models/paymentOptionModel/paymentOptionModel";

export interface adminDepositOptionListResponse {
  status: StatusCodeEnums;
  message: string;
  data?: [{ total: number; results: paymentOptionOutput }];
}
