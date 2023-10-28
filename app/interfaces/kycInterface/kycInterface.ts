import { kycStatusEnums } from "@/enums/kycStatusEnums/kycStatusEnums";
import { kycVerifiedTypeEnums } from "@/enums/kycVerifiedTypeEnums/kycVerifiedTypeEnums";
import { Date, Schema } from "mongoose";

export default interface kycAttributes {
  _id: Schema.Types.ObjectId;
  iUserId: Schema.Types.ObjectId;
  sIdfyGroupId: string;
  oPan: {
    sNo: string;
    sDateOfBirth: string;
    eStatus: kycStatusEnums; // P = Pending, A = Accepted, R = Rejected, N = Not uploaded
    sImage: string;
    sName: string;
    sRejectReason: string;
    dCreatedAt: Date;
    dUpdatedAt: Date;
    oVerifiedAt: {
      dActionedAt: Date;
      iAdminId: Schema.Types.ObjectId;
      sIP: string;
    };
    eVerifiedBy: kycVerifiedTypeEnums;
  };
  oAadhaar: {
    nNo: { type: Number };
    sAadharHashedNumber: string;
    sDateOfBirth: string;
    sAadharName: string;
    sFrontImage: { type: String; trim: true };
    sBackImage: { type: String; trim: true };
    eStatus: kycStatusEnums; // P = Pending, A = Accepted, R = Rejected, N = Not uploaded
    sRejectReason: string;
    dUpdatedAt: Date;
    dCreatedAt: Date;
    oVerifiedAt: {
      dActionedAt: Date;
      iAdminId: Schema.Types.ObjectId;
      sIP: string;
    };
    sPincode: string;
    sState: string;
    eVerifiedBy: kycVerifiedTypeEnums;
  };
  sMessage: string;
  sExternalId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
