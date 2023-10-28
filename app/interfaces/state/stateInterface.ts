import { statusEnums } from "@/enums/commonEnum/commonEnum";

export interface stateAttributes {
  _id: string;
  nCountryId: number;
  sName: string;
  eStatus: statusEnums;
  sExternalId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
