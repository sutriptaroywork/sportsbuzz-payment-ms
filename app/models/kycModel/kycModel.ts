import { Schema } from "mongoose";
import { UsersDBConnect } from "@/connections/database/mongodb/mongodb";
import KycAttributes from "@/interfaces/kycInterface/kycInterface";
import UserModel from "../userModel/userModel";
import { kycStatusEnums } from "@/enums/kycStatusEnums/kycStatusEnums";
import AdminModel from "../adminModel/adminModel";
import { kycVerifiedTypeEnums } from "@/enums/kycVerifiedTypeEnums/kycVerifiedTypeEnums";

export interface KycModelInput extends Omit<KycAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface KycModelOutput extends Required<KycAttributes> {}

const KycSchema = new Schema<KycAttributes>(
  {
    iUserId: { type: Schema.Types.ObjectId, ref: UserModel, unique: true },
    sIdfyGroupId: { type: String },
    oPan: {
      sNo: { type: String },
      sDateOfBirth: { type: String },
      eStatus: { type: String, enum: kycStatusEnums, default: kycStatusEnums.NOT_UPLOADED }, // P = Pending, A = Accepted, R = Rejected, N = Not uploaded
      sImage: { type: String, trim: true },
      sName: { type: String },
      sRejectReason: { type: String },
      dCreatedAt: { type: Date, default: Date.now },
      dUpdatedAt: { type: Date },
      oVerifiedAt: {
        dActionedAt: { type: Date },
        iAdminId: { type: Schema.Types.ObjectId, ref: AdminModel },
        sIP: { type: String },
      },
      eVerifiedBy: { type: String, enum: kycVerifiedTypeEnums },
    },
    oAadhaar: {
      nNo: { type: Number },
      sAadharHashedNumber: { type: String },
      sDateOfBirth: { type: String },
      sAadharName: { type: String },
      sFrontImage: { type: String, trim: true },
      sBackImage: { type: String, trim: true },
      eStatus: { type: String, enum: kycStatusEnums, default: kycStatusEnums.NOT_UPLOADED }, // P = Pending, A = Accepted, R = Rejected, N = Not uploaded
      sRejectReason: { type: String },
      dUpdatedAt: { type: Date },
      dCreatedAt: { type: Date, default: Date.now },
      oVerifiedAt: {
        dActionedAt: { type: Date },
        iAdminId: { type: Schema.Types.ObjectId, ref: AdminModel },
        sIP: { type: String },
      },
      sPincode: { type: String },
      sState: { type: String },
      eVerifiedBy: { type: String, enum: kycVerifiedTypeEnums },
    },
    sMessage: { type: String },
    sExternalId: { type: String },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

KycSchema.index({ sKey: 1 });

const KycModel = UsersDBConnect.model("Kyc", KycSchema);

export default KycModel;
