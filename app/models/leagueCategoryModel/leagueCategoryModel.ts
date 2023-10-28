import { Schema } from "mongoose";
import { LeaguesDBConnect } from "@/connections/database/mongodb/mongodb";
import { LeagueCategoryAttributes } from "@/interfaces/leagueCategory/leagueCategoryInterface";

export interface LeagueCategoryModelInput extends Omit<LeagueCategoryAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface LeagueCategoryModelOutput extends Required<LeagueCategoryAttributes> {}

const LeagueCategorySchema = new Schema<LeagueCategoryAttributes>(
  {
    Title: {
      type: String,
      trim: true,
      required: true,
    },
    Position: {
      type: Number,
      required: true,
    },
    Remark: {
      type: String,
      trim: true,
    },
    Key: {
      type: String,
    },
    Image: {
      type: String,
    },
    ExternalId: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" },
  },
);

LeagueCategorySchema.index({ sKey: 1 });

const LeagueCategoryModel = LeaguesDBConnect.model("leaguecategories", LeagueCategorySchema);

export default LeagueCategoryModel;
