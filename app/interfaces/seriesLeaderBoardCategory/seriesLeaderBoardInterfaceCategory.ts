import { ObjectId } from "mongodb";
import { SeriesLBCategoriesTemplateTypeEnums } from "@/enums/seriesLBCategoriesTemplateTypeEnums/seriesLBCategoriesTemplateTypeEnums";

export interface SeriesLBCategoriesTemplateAttributes {
  _id: ObjectId;
  sName: string;
  eType: SeriesLBCategoriesTemplateTypeEnums;
  sInfo: string;
  sImage: string;
  sColumnText: string;
  sExternalId: string;

  updatedAt: Date;
  createdAt: Date;
}
