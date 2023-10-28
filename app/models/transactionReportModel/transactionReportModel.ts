import { transactionReportAttributes } from "@/interfaces/transactionReport/transactionReportAttributes";
import { Schema } from "mongoose";
import AdminModel from "../adminModel/adminModel";
import MatchModel from "../matchModel/matchModel";
import MatchLeagueModel from "../matchLeagueModel/matchLeagueModel";
import { matchLeagueReportStatusEnums } from "@/enums/matchLeagueReportStatus/matchLeagueReportStatus";
import { ReportsDBConnect } from "@/connections/database/mongodb/mongodb";

export interface transactionReportModelInput extends Omit<transactionReportAttributes, "_id" | "updatedAt" | "createdAt"> {}
export interface transactionReporModelOutput extends Required<transactionReportAttributes> {}

const transactionReportSchema = new Schema<transactionReportAttributes>(
  {
    iAdminId: { type: Schema.Types.ObjectId, ref: AdminModel },
    iMatchId: { type: Schema.Types.ObjectId, ref: MatchModel },
    iMatchLeagueId: { type: Schema.Types.ObjectId, ref: MatchLeagueModel },
    oFilter: { type: Object },
    sReportUrl: { type: String, trim: true },
    nTotal: { type: Number },
    eStatus: { type: String, enum: matchLeagueReportStatusEnums, default: matchLeagueReportStatusEnums.IN_PROCESS },
    dDateFrom: { type: Date },
    dDateTo: { type: Date },
    sExternalId: { type: String },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

export const transactionReportModel = ReportsDBConnect.model("transactionReport", transactionReportSchema);
