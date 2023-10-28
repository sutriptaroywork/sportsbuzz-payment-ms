import { PromoCodeTypesEnums } from "@/enums/promoCodeTypeEnums/promoCodeTypeEnums";
import { StatusTypeEnums } from "@/enums/statusTypeEnums/statusTypeEnums";
import { ObjectId } from "mongodb";

export interface PromoCodeAttributes {
  _id: ObjectId;
  sName: string;
  sCode: string;
  sInfo: string;
  bIsPercent: boolean;
  nAmount: number;
  bShow: boolean;
  eStatus: StatusTypeEnums;
  nMinAmount: number;
  nMaxAmount: number;
  aLeagues: Array<ObjectId>;
  aMatches: Array<ObjectId>;
  eType: PromoCodeTypesEnums;
  nMaxAllow: number;
  bMaxAllowForAllUser: boolean;
  nPerUserUsage: number;
  dStartTime: Date;
  dExpireTime: Date;
  nBonusExpireDays: number;
  sExternalId: string;

  updatedAt: Date;
  createdAt: Date;
}

export interface PromoCodeCheck {
  status: number;
  data?: {
    promoCodeDiscount?: number; //nPromoDiscount
    promoCodeId?: string; //iPromocodeId
    promoCode?: string; //sPromoCode
  };
}
