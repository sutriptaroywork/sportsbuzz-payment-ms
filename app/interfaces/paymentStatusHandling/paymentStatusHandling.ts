import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import { ObjectId } from "mongoose";
import { Transaction } from "sequelize";
import { oGST } from "../gst/calculateGSTResponse";

export default interface paymentStatusHandling {
  iUserId: string;
  t: Transaction;
  deposit: UserDepositOutput;
  nCash: number;
  nBonus: number;
  nAmount: number;
  eUserType: UserTypeEnums;
  paymentStatus: string;
  referenceId: string;
  oGST: oGST;
}
