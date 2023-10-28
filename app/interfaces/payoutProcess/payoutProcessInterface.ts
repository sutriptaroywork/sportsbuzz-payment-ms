import { payoutStatusEnums } from "@/enums/payoutStatusEnums/payoutStatusEnums";

export default interface payoutProcessInterface {
  ePaymentStatus: payoutStatusEnums;
  reject_reason: string;
  iAdminId: string;
  iWithdrawId: number;
  iPassbookId: number;
  ip: string;
  isVerify: boolean;
  Token: string;
}
