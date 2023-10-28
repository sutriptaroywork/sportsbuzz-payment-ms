import { ObjectId } from "mongodb";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";

export interface UserTeamAttributes {
  _id: ObjectId;
  iMatchId: ObjectId;
  iUserId: ObjectId;
  sName: string;
  iCaptainId: ObjectId;
  iViceCaptainId: ObjectId;
  nTotalPoints: number;
  sHash: string;
  bPointCalculated: boolean;
  bSwapped: boolean; // it's true when combination bot replaced with copy bot userTeam and vice versa.
  eCategory: CategoryTypeEnums;
  eType: UserTypeEnums; // U = USER B = BOT
  dUpdatedAt: Date;
  dCreatedAt: Date;
  sExternalId: string;

  createdAt?: Date;
  updatedAt?: Date;
}
