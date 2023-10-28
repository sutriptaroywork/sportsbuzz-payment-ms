import { payoutOptionEnums } from "@/enums/payoutOptionEnums/payoutOption";
import { Date, ObjectId } from "mongoose";

export default interface payoutOptionAttributes {
  _id: ObjectId;
  sTitle: string;
  sImage: string;
  eKey: payoutOptionEnums;
  sInfo: string;
  nWithdrawFee: number;
  nMinAmount: number;
  nMaxAmount: number;
  bEnable: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
