import { payoutOptionEnums } from "@/enums/payoutOptionEnums/payoutOption";
import { SettingsOutput } from "@/models/settingsModel/settingsModel";
import { UserModelOutput } from "@/models/userModel/userModel";

export interface processWithdrawInterface {
    user: UserModelOutput;
    nAmount: string;
    ePaymentGateway: payoutOptionEnums;
    nWithdrawFee: number;
    winBifurcate: SettingsOutput;
}