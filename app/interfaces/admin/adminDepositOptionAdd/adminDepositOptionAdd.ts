import { statusEnums } from "@/enums/commonEnum/commonEnum";
import { depositOptionsKey } from "@/enums/depositOptionsKey/depositOptionsKey";

export default interface adminDepositOptionAdd {
  sName: string;
  nOrder: number;
  sImage: string;
  sOffer: string;
  sKey: depositOptionsKey;
  eStatus: statusEnums;
}
