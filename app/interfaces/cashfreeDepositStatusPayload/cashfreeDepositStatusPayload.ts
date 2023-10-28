import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";

export interface CashfreeDepositStatusPayload {
    iUserId: string;
    iOrderId: string;
  }

export interface CashfreeDepositStatusData extends UserDepositOutput {
    ePaymentStatus: paymentStatusEnum;
}

export interface CashfreeDepositStatusResponse extends defaultResponseInterface {
    data?: CashfreeDepositStatusData;
}