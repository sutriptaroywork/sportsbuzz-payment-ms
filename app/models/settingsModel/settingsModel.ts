import { Schema } from "mongoose";
import { settingsAttributes } from "@interfaces/settingsInterface/settingsInterface";
import { StatusTypeEnums } from "@enums/statusTypeEnums/statusTypeEnums";
import { StatisticsDBConnect } from "@/connections/database/mongodb/mongodb";

export interface SettingsInput extends Omit<settingsAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface SettingsOutput extends Required<settingsAttributes> {}

const settingsSchema = new Schema<settingsAttributes>(
  {
    sTitle: { type: String, required: true },
    sKey: { type: String, required: true, unique: true },
    nMax: { type: Number },
    nMin: { type: Number },
    sLogo: { type: String },
    nPosition: { type: Number },
    sImage: { type: String },
    sDescription: { type: String },
    sShortName: { type: String, trim: true },
    eStatus: { type: String, enum: StatusTypeEnums, default: StatusTypeEnums.YES }, // Y = Active, N = Inactive
    sExternalId: { type: String },
    sValue: { type: String },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);
settingsSchema.index({ sTitle: 1 });
settingsSchema.index({ sKey: 1 });

const settingsModel = StatisticsDBConnect.model("settings", settingsSchema);
export default settingsModel;
