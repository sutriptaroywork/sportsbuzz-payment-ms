import { ObjectId } from "mongodb";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { SeriesCategoryInterface } from "../seriesCategory/seriesCategoryInterface";
import { SeriesStatusTypeEnums } from "@/enums/seriesStatusTypeEnums/seriesStatusTypeEnums";

export interface SeriesLeaderBoardAttributes {
  _id: ObjectId;
  sName: string;
  sKey: string;
  sInfo: string;
  eCategory: CategoryTypeEnums;
  eStatus: SeriesStatusTypeEnums;
  aSeriesCategory: Array<SeriesCategoryInterface>;
  dWinDistributedAt: Date;
  bPriceDone: boolean;

  updatedAt: Date;
  createdAt: Date;
}
