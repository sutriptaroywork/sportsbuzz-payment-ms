import { Schema } from "mongoose";
import { GamesDBConnect } from "@/connections/database/mongodb/mongodb";
import { SeasonAttributes } from "@/interfaces/season/seasonInterface";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { MatchProviderTypesEnums } from "@/enums/matchProviderTypesEnums/matchProviderTypeEnums";

export interface SeasonModelInput extends Omit<SeasonAttributes, "_id" | "updatedAt" | "createdAt"> {}
export interface SeasonModelOutput extends Required<SeasonAttributes> {}

const SeasonSchema = new Schema<SeasonAttributes>(
  {
    sName: {
      type: String,
    },
    sKey: {
      type: String,
      required: true,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    dStartDate: {
      type: Date,
    },
    dEndDate: {
      type: Date,
    },
    eProvider: {
      type: String,
      enum: MatchProviderTypesEnums,
      default: MatchProviderTypesEnums.CUSTOM,
    },
    sExternalId: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const SeasonModel = GamesDBConnect.model("seasons", SeasonSchema);

export default SeasonModel;
