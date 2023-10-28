import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { ObjectId } from "mongoose";

export interface paymentOptionAttributes {
  _id: ObjectId;
  sName: string;
  nOrder: number;
  sImage: string;
  eKey: paymentOptionEnums;
  sOffer: string;
  bEnable: boolean;
  sExternalId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
