import { Schema } from "mongoose";
import { SeriesLBDBConnect } from "@/connections/database/mongodb/mongodb";
import { SeriesLBCategoriesTemplateAttributes } from "@/interfaces/seriesLeaderBoardCategory/seriesLeaderBoardInterfaceCategory";
import { SeriesLBCategoriesTemplateTypeEnums } from "@/enums/seriesLBCategoriesTemplateTypeEnums/seriesLBCategoriesTemplateTypeEnums";

export interface SeriesLBCategoriesTemplateModelInput
  extends Omit<SeriesLBCategoriesTemplateAttributes, "_id" | "updatedAt" | "createdAt"> {}
export interface SeriesLBCategoriesTemplateModelOutput extends Required<SeriesLBCategoriesTemplateAttributes> {}

const SeriesLBCategoriesTemplateSchema = new Schema<SeriesLBCategoriesTemplateAttributes>(
  {
    sName: {
      type: String,
      required: true,
    },
    eType: {
      type: String,
      enum: SeriesLBCategoriesTemplateTypeEnums,
      default: SeriesLBCategoriesTemplateTypeEnums.CONTEST_JOIN,
    },
    sInfo: {
      type: String,
    },
    sImage: {
      type: String,
    },
    sColumnText: {
      type: String,
    },
    sExternalId: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const SeriesLBCategoriesTemplateModel = SeriesLBDBConnect.model(
  "series_leader_board_categories_templates",
  SeriesLBCategoriesTemplateSchema,
);

export default SeriesLBCategoriesTemplateModel;
