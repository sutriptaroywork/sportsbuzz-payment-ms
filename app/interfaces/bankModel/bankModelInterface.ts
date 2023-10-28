import { bankStatusEnums } from "@/enums/bankStatusEnums/bankStatusEnums";
import { Date, ObjectId } from "mongoose";
import { userPopulateInterface } from "../user/userInterface";
export default interface bankModelAttributes {
  _id: ObjectId;
  iUserId: ObjectId;
  sBankName: string;
  sBranchName: string;
  sAccountHolderName: string;
  sAccountNo: string;
  sIFSC: string;
  eStatus: bankStatusEnums; // P = Pending, A = Accepted, R = Rejected
  sRejectReason: string;
  bIsBankApproved: boolean;
  sExternalId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BankPopulate extends Omit<bankModelAttributes, "iUserId"> {
  iUserId: userPopulateInterface | null;
}
