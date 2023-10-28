import { StatusCodeEnums } from "@/enums/commonEnum/commonEnum";
import cashfreePaymentResponse from "../cashfreePayment/cashfreePayment";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";

export interface cashfreeResponse extends cashfreePaymentResponse {
  iOrderId: string;
  nOrderAmount: number;
  sOrderCurrency: string;
  sCustId: string;
  sCustEmail: string;
  sCustName: string;
  sCustPhone: string;
  sNotifyUrl: string;
  sReturnUrl: string;
  gateway: paymentGatewayEnums;
}
export interface responsePayload {
  status: StatusCodeEnums;
  message: string;
  data?: cashfreeResponse;
}

export interface responsePayloadUserDeposit {
  status: StatusCodeEnums;
  message: string;
  data?: { bIsInternalUserDeposit: boolean };
}
