import {
  transactionReporModelOutput,
  transactionReportModel,
  transactionReportModelInput,
} from "@/models/transactionReportModel/transactionReportModel";
import BaseMongoDao from "../baseMongoDao";

export class transactionReportDao extends BaseMongoDao<transactionReportModelInput, transactionReporModelOutput> {
  constructor() {
    super(transactionReportModel);
  }

  public findAndSort = async ({ query, sorting, start, limit }): Promise<transactionReporModelOutput[]> => {
    return await this.model
      .find(query)
      .sort(sorting)
      .skip(Number(start))
      .limit(Number(limit))
      .lean()
      .populate([
        { path: "iAdminId", select: "sUsername" },
        { path: "iMatchId", select: "sName" },
        { path: "iMatchLeagueId", select: "sName" },
      ]);
  };
}
