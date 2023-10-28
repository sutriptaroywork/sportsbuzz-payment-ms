import { MatchDBConnect } from "@/connections/database/mongodb/mongodb";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { MatchProviderTypesEnums } from "@/enums/matchProviderTypesEnums/matchProviderTypeEnums";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { Schema, model, ObjectId } from "mongoose";

/**
 * This interface is defined in teamModel.ts file which is in team folder inside models folder.
 */
interface TeamAttributes {
  _id: ObjectId;
  sKey: string;
  sName: string;
  sShortName: string;
  sThumbUrl: string;
  eCategory: string;
  eStatus: string;
  eLogoUrl: string;
  sLogoUrl: string;
  sImage: string;
  eProvider: string;
  sExternalId: string;

  updatedAt: Date;
  createdAt: Date;
}

export interface TeamModelInput extends Omit<TeamAttributes, "_id" | "updatedAt" | "createdAt"> {}
export interface TeamModelOutput extends Required<TeamAttributes> {}

const TeamSchema = new Schema<TeamAttributes>(
  {
    sKey: {
      type: String,
      trim: true,
      required: true,
    },
    sName: {
      type: String,
      trim: true,
    },
    sShortName: {
      type: String,
      trim: true,
    },
    sThumbUrl: {
      type: String,
      trim: true,
    },
    eCategory: {
      type: String,
      enum: CategoryTypeEnums,
      default: CategoryTypeEnums.CRICKET,
    },
    eStatus: {
      type: String,
      enum: StatusTypeEnums,
      default: StatusTypeEnums.YES,
    }, // Y = Active, N = Inactive
    sLogoUrl: {
      type: String,
      trim: true,
    },
    sImage: {
      type: String,
      trim: true,
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

const TeamModel = MatchDBConnect.model("teams", TeamSchema);

export default TeamModel;
