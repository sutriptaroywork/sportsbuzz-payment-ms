import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { UserModelOutput } from "@/models/userModel/userModel";

export interface paymentPayload {
  ePlatform: PlatformTypesEnums;
  eType: paymentOptionEnums;
  nAmount: string;
  sPromocode?: string;
  ePaymentGateway?: paymentOptionEnums;
  user: UserModelOutput;
  lang: string;
}
