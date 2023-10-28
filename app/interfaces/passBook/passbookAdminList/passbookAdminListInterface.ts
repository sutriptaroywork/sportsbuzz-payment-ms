import { categoryTransactionType } from "@/enums/categoryTransactionTypeEnums/categoryTransactionTypeEnums";
import { passbookSearchType } from "@/enums/passbookSearchTypeEnums/passbookSearchTypeEnums";
import { PassbookStatusTypeEnums, PassbookTypeEnums } from "@/enums/passbookTypeEnums/passbookTypeEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import defaultResponseInterface from "../../defaultResponse/defaultResponseInterface";
import { UserFieldsPassbook } from "../../userFields/userFieldsInterface";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { ObjectId } from "mongoose";

export interface passbookAdminList {
  start: string;
  limit: string;
  sort: string;
  order: string;
  search: string;
  searchType: passbookSearchType;
  datefrom: string;
  dateto: string;
  particulars: categoryTransactionType;
  type: PassbookTypeEnums;
  id: string;
  isFullResponse: boolean;
  eStatus: PassbookStatusTypeEnums;
  eUserType: UserTypeEnums;
  sportsType: string;
}

export interface passbookMatchLeagueWiseList {
  start: string;
  limit: string;
  sort: string;
  order: string;
  search: string;
  searchType: passbookSearchType;
  datefrom: string;
  dateto: string;
  particulars: categoryTransactionType;
  type: PassbookTypeEnums;
  id: string;
  isFullResponse: boolean;
  eStatus: PassbookStatusTypeEnums;
  eUserType: UserTypeEnums;
  sportsType: string;
  iMatchLeagueId: string;
}

export interface passbookAdminListResponse extends defaultResponseInterface {
  data: { rows: UserFieldsPassbook[] };
}

export interface passbookMatchLeagueListResponse extends defaultResponseInterface {
  data: UserFieldsPassbook[] | { rows: [] };
}

export interface generateReportPayloadInterface {
  dDateFrom: string;
  dDateTo: string;
  eCategory: CategoryTypeEnums;
  eStatus: string;
  eTransactionType: categoryTransactionType;
  eType: PassbookTypeEnums;
  iMatchId: string;
  iMatchLeagueId: string;
  iAdminId: ObjectId;
}
