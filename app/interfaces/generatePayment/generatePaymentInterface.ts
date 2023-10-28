import { languageEnums } from "@/enums/commonEnum/commonEnum";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { UserModelOutput } from "@/models/userModel/userModel";

export interface GeneratePaymentInterface {
    user: UserModelOutput;
    ePlatform: PlatformTypesEnums;
    nAmount: string;
    lang: languageEnums;
    eType: paymentOptionEnums;
    sPromocode? : string;
}