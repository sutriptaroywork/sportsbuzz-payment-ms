import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";

export interface promocodeHandling {
  iUserId: string;
  nAmount: number;
  sPromocode?: string;
  t: any;
  iOrderId: string;
  iTransactionId: string;
  paymentStatus: paymentStatusEnum;
  ePaymentGateway: paymentOptionEnums;
  eType: string;
}
