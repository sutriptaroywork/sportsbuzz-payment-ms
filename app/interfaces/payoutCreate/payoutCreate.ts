import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";

export default interface payoutCreateInterface {
  ePaymentStatus: paymentStatusEnum;
  nAmount: string;
  payoutOptionId: string;
  userId: string;
}
