import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import { UserModelOutput } from "@/models/userModel/userModel";

export interface paymentOptionHandling {
  eType: paymentOptionEnums;
  iOrderId: string;
  ePlatform: PlatformTypesEnums;
  user: UserModelOutput;
  userDeposit: UserDepositOutput;
}
