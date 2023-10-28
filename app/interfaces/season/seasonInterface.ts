import { ObjectId } from "mongodb";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { MatchProviderTypesEnums } from "@/enums/matchProviderTypesEnums/matchProviderTypeEnums";

export interface SeasonAttributes {
  _id: ObjectId;
  sName: string;
  sKey: string;
  eCategory: CategoryTypeEnums;
  dStartDate: Date;
  dEndDate: Date;
  eProvider: MatchProviderTypesEnums;
  sExternalId: string;

  createdAt: Date;
  updatedAt: Date;
}
