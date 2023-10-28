import { Schema } from "mongoose";
import { LeaguesDBConnect } from "@/connections/database/mongodb/mongodb";
import { FilterCategoryAttributes } from "@/interfaces/filterCategory/filterCategory";

export interface FilterCategoryModelInput extends Omit<FilterCategoryAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface FilterCategoryModelOutput extends Required<FilterCategoryAttributes> {}

const FilterCategorySchema = new Schema<FilterCategoryAttributes>(
  {
    sTitle: {
      type: String,
      trim: true,
      required: true,
    },
    sRemark: {
      type: String,
      trim: true,
    },
    sExternalId: {
      type: String,
    },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

const FilterCategoryModel = LeaguesDBConnect.model("filtercategories", FilterCategorySchema);

export default FilterCategoryModel;
