import { Schema } from "mongoose";
import { cityAttributes } from "@/interfaces/city/cityInterface";
import { StatisticsDBConnect } from "@/connections/database/mongodb/mongodb";

export interface cityInputModel extends Omit<cityAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface cityOutputModel extends Required<cityAttributes> {}

const Cities = new Schema(
  {
    id: { type: Number, require: true },
    nStateId: { type: Number, trim: true }, // check
    sName: { type: String, trim: true },
    sExternalId: { type: String },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

Cities.index({ sName: 1, nStateId: 1 });

const cityModel = StatisticsDBConnect.model("cities", Cities);
export default cityModel;
