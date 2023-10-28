import { Schema } from "mongoose";
import { UsersDBConnect } from "@/connections/database/mongodb/mongodb";
import bankModelAttributes from "@/interfaces/bankModel/bankModelInterface";
import UserModel from "../userModel/userModel";
import { bankStatusEnums } from "@/enums/bankStatusEnums/bankStatusEnums";

export interface bankModelInput extends Omit<bankModelAttributes, "_id" | "createdAt" | "updatedAt"> {}

export interface bankModelOutput extends Required<bankModelAttributes> {}

const bankModelSchema = new Schema<bankModelAttributes>(
  {
    iUserId: { type: Schema.Types.ObjectId, ref: UserModel, unique: true },
    sBankName: { type: String, required: true, trim: true },
    sBranchName: { type: String, required: true, trim: true },
    sAccountHolderName: { type: String, required: true, trim: true },
    sAccountNo: { type: String, required: true, trim: true, unique: true },
    sIFSC: { type: String, required: true, trim: true },
    eStatus: { type: String, enum: bankStatusEnums, default: bankStatusEnums.PENDING }, // P = Pending, A = Accepted, R = Rejected
    sRejectReason: { type: String },
    bIsBankApproved: { type: Boolean, default: true },
    sExternalId: { type: String },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const bankModel = UsersDBConnect.model("bankDetail", bankModelSchema);
export default bankModel;
