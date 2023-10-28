import { Schema } from "mongoose";
import { StatisticsDBConnect } from "@/connections/database/mongodb/mongodb";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { paymentOptionAttributes } from "@/interfaces/paymentOption/paymentOptionInterface";

export interface paymentOptionInput
  extends Omit<paymentOptionAttributes, "_id" | "createdAt" | "updatedAt" | "bEnable" | "eKey" | "sExternalId"> {}
export interface paymentOptionOutput extends Required<paymentOptionAttributes> {}

const PaymentOption = new Schema<paymentOptionAttributes>(
  {
    sName: { type: String, required: true },
    nOrder: { type: Number },
    sImage: { type: String, trim: true },
    eKey: { type: String, enum: paymentOptionEnums, default: paymentOptionEnums.CASHFREE },
    sOffer: { type: String },
    bEnable: { type: Boolean, default: false },
    sExternalId: { type: String },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

PaymentOption.index({ bEnable: 1 });
PaymentOption.index({ eKey: 1, bEnable: 1 });

export default StatisticsDBConnect.model("paymentoptions", PaymentOption);
