import { matchLeagueReportStatusEnums } from "@/enums/matchLeagueReportStatus/matchLeagueReportStatus";
import { ObjectId } from "mongoose";

export interface transactionReportAttributes {
  _id: ObjectId;
  iAdminId: ObjectId;
  iMatchId: ObjectId | string;
  iMatchLeagueId: String;
  oFilter: Object;
  sReportUrl: String;
  nTotal: number;
  eStatus: matchLeagueReportStatusEnums | string;
  dDateFrom: string | Date;
  dDateTo: string | Date;
  sExternalId: String;
  createdAt?: Date;
  updatedAt?: Date;
}
