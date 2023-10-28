import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { PassbookOutput } from "@/models/passbookModel/passbookModel";
import { transactionReporModelOutput } from "@/models/transactionReportModel/transactionReportModel";
import { ObjectId } from "mongoose";

export interface transactionListInterface extends defaultResponseInterface {
  data: PassbookOutput[]
}
export interface transactionListPayload {
  datefrom: string;
  dateto: string;
  start: string;
  limit: string;
  sort: string;
  order: string;
  search: string
  iAdminId: string;
}



export default interface transactionReportListInterface extends defaultResponseInterface {
  data?: {aData: transactionReporModelOutput[], nTotal: number }
}