import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { SettingsOutput } from "@/models/settingsModel/settingsModel";

export interface CreateAdminDepositPayload {
    iUserId: string, nCash: any, nBonus: any, eType: string, sPassword: string, sIP: string; _id: string; bonusExpireDays: SettingsOutput;
}

export interface processAdminDepositPayload {
    ePaymentStatus: paymentStatusEnum, iAdminId: string, id: string, sIP: string
}
