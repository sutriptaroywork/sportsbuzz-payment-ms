import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { UserModelOutput } from "@/models/userModel/userModel";
import { userWithdrawOutput } from "@/models/userWithdrawModel/userWithdrawModel";

export interface adminWithdrawListInterface {
  start: number;
  limit: number;
  sort: string;
  order: string;
  search: string;
  status: paymentStatusEnum;
  method: string;
  datefrom: string;
  dateto: string;
  isFullResponse: string;
  reversedFlag: string;
}

export interface adminWithdrawListResponse extends defaultResponseInterface {
  data?: { rows: userWithdrawOutput[]}
}

export interface adminWithdrawCountResponse extends defaultResponseInterface {
  data: { count: number }
}
