import { ObjectId } from "mongodb";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";

export interface PromoCodeStatisticAttributes {
  _id: ObjectId;
  iPromocodeId: ObjectId;
  iUserId: ObjectId;
  idepositId: number;
  nAmount: number;
  sTransactionType: string;
  iMatchId: ObjectId;
  iMatchLeagueId: ObjectId;
  iUserLeagueId: ObjectId;
  eStatus: StatusTypeEnums;
  sExternalId: string;

  createdAt?: Date;
  updatedAt?: Date;
}
