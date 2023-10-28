import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { DataTypes, IntegerDataType } from "sequelize";
import defaultResponseInterface from "../defaultResponse/defaultResponseInterface";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import { UserModelOutput } from "@/models/userModel/userModel";

export interface UserDepositAttributes {
  id: IntegerDataType;
  iReferenceId: number;
  iUserId: string;
  ePaymentGateway: paymentOptionEnums;
  ePaymentStatus: paymentStatusEnum;
  sInfo: string;
  sPromocode: string;
  iPromocodeId: string;
  iTransactionId: string;
  iOrderId: string;
  nAmount: number;
  nCash: number;
  nBonus: number;
  eUserType: UserTypeEnums;
  ePlatform: PlatformTypesEnums; // A = Android, I = iOS, W = Web, O = Other, AD = Admin
  dProcessedDate: DataTypes.DateDataType;
}

export interface UserDepositAdminList {
  datefrom: string; dateto : string; start : any, limit : any, sort : string, order: string, search : string, status: string, method : string,isFullResponse : boolean, query: any[]; aUsersList? : any[]
}

export interface UserDepositAdminListResponse extends defaultResponseInterface {
  data: {rows : UserDepositOutput[]}
}

export interface adminDepositList {
  data: UserDepositOutput[],
  aUsers: UserModelOutput[]
}
export interface UserDepositAdminCountResponse extends defaultResponseInterface {
  data: number
}
