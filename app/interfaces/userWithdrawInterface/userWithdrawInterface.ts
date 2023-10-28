import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { payoutStatusEnums } from "@/enums/payoutStatusEnums/payoutStatusEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { DateDataType, IntegerDataType } from "sequelize";

export default interface userWithdrawInterface {
  id: IntegerDataType;
  iUserId: string;
  ePaymentGateway: paymentGatewayEnums;
  ePaymentStatus: payoutStatusEnums; // pending success cancelled refunded initiated
  sInfo: string;
  nAmount: number;
  nParentId: number;
  iWithdrawalDoneBy: string;
  dWithdrawalTime: DateDataType;
  nWithdrawFee: number;
  sIP: string;
  eUserType: UserTypeEnums;
  ePlatform: PlatformTypesEnums; // A = Android, I = iOS, W = Web, O = Other, AD = Admin
  dCreatedAt: DateDataType;
  dUpdatedAt: DateDataType;
  dProcessedDate: DateDataType;
  dReversedDate: DateDataType;
  bReversed: number;
  iTransactionId: string;
}
