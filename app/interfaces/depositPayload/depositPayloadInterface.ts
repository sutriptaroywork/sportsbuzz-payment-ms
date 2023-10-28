import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { UserModelOutput } from "@/models/userModel/userModel";

export interface depositPayloadInterface {
  user: UserModelOutput;
  nAmount: number;
  sPromocode?: string;
  ePaymentGateway?: paymentOptionEnums;
}