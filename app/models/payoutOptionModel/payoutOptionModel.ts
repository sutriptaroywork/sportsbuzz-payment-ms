import { StatisticsDBConnect } from "@/connections/database/mongodb/mongodb";
import { payoutOptionEnums } from "@/enums/payoutOptionEnums/payoutOption";
import payoutOptionAttributes from "@/interfaces/payoutOption/payoutOptionInterface";
import { Schema } from "mongoose";

export interface payoutOptionInput extends Omit<payoutOptionAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface payoutOptionOutput extends Required<payoutOptionAttributes> {}

const payoutOptionSchema = new Schema<payoutOptionAttributes>(
  {
    sTitle: { type: String, required: true },
    sImage: { type: String, trim: true },
    eKey: { type: String, enum: payoutOptionEnums, default: payoutOptionEnums.ACCOUNT_IFSC },
    sInfo: { type: String },
    nWithdrawFee: { type: Number, default: 0 },
    nMinAmount: { type: Number, default: 0 },
    nMaxAmount: { type: Number, default: 0 },
    bEnable: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);
payoutOptionSchema.index({ eStatus: 1, eKey: 1 });

const payoutOptionModel = StatisticsDBConnect.model("payoutoptions", payoutOptionSchema);
export default payoutOptionModel;
