import { ObjectId } from "mongodb";
import { PlayerRoleEnums } from "@/enums/matchPlayerEnums/matchPlayerEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { MatchProviderTypesEnums } from "@/enums/matchProviderTypesEnums/matchProviderTypeEnums";

export interface PlayerAttributes {
  sKey: string;
  sName: string;
  eCategory: CategoryTypeEnums;
  sImage: string;
  nFantasyCredit: number;
  eRole: PlayerRoleEnums;
  iTeamId: ObjectId;
  eProvider: MatchProviderTypesEnums;
  dUpdatedAt: Date;
  dCreatedAt: Date;
  sExternalId: string;

  createdAt?: Date;
  updatedAt?: Date;
}
