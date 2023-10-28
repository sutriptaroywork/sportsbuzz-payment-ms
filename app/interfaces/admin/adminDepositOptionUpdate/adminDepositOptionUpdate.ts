import { statusEnums } from "@/enums/commonEnum/commonEnum";
import { depositOptionsKey } from "@/enums/depositOptionsKey/depositOptionsKey";

export default interface adminDepositOptionUpdate {
  id: string;
  sImage: string;
  sName: string;
  nOrder: number;
  sOffer: string;
  bEnable: boolean;
  sKey: depositOptionsKey;
  eStatus: statusEnums;
}
