import { Schema } from "mongoose";
import { stateAttributes } from "@/interfaces/state/stateInterface";
import { statusEnums } from "@/enums/commonEnum/commonEnum";
import { StatisticsDBConnect } from "@/connections/database/mongodb/mongodb";

export interface StateInputModel extends Omit<stateAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface StateOutputModel extends Required<stateAttributes> {}

const States = new Schema(
  {
    id: { type: Number, require: true }, // check need to work on it
    nCountryId: { type: Number, trim: true }, // check
    sName: { type: String, trim: true },
    eStatus: { type: String, enum: statusEnums, default: statusEnums.Y },
    sExternalId: { type: String },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

States.index({ sName: 1 });

const stateModel = StatisticsDBConnect.model("states", States);
export default stateModel;
