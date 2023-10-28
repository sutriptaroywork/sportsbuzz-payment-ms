import { PromoCodeTypesEnums } from "@/enums/promoCodeTypeEnums/promoCodeTypeEnums";
import PromoCodeModel, { PromoCodeModelInput, PromoCodeModelOutput } from "@/models/promoCodeModel/promoCodeModel";
import { ObjectId } from "mongodb";
import BaseMongoDao from "../baseMongoDao";
import { promoCodeStats } from "@/enums/commonEnum/commonEnum";

export default class PromoCodeDao extends BaseMongoDao<PromoCodeModelInput, PromoCodeModelOutput> {
  constructor() {
    super(PromoCodeModel);
  }

  /**
   * This async method serves promo-code details by ID.
   * @param promoCodeId
   * @param matchId
   * @param leagueId
   * @returns Promise<PromoCodeModelOutput>
   */
  public getPromoCodeById = async (
    promoCodeId: string,
    matchId: ObjectId,
    leagueId: ObjectId,
  ): Promise<PromoCodeModelOutput> => {
    let promoCodeData: PromoCodeModelOutput = await this.model.findOne({
      sCode: promoCodeId.toUpperCase(),
      $or: [{ aMatches: matchId }, { aLeagues: leagueId }],
      dStartTime: { $lt: new Date(Date.now()) },
      dExpireTime: { $gt: new Date(Date.now()) },
      eType: PromoCodeTypesEnums.MATCH,
    });
    return promoCodeData;
  };

  public getPromocode = async (status: promoCodeStats, promocode: string): Promise<PromoCodeModelOutput> => {
    return await this.model.findOne(
      {
        eStatus: status,
        sCode: promocode.toUpperCase(),
        dStartTime: { $lt: new Date(Date.now()) },
        dExpireTime: { $gt: new Date(Date.now()) },
      },
      {
        nAmount: 1,
        bMaxAllowForAllUser: 1,
        dExpireTime: 1,
        bIsPercent: 1,
        nMaxAllow: 1,
        nPerUserUsage: 1,
        nBonusExpireDays: 1,
        nMaxAmount: 1,
        nMinAmount: 1,
      },
    ).lean();
  };

  public findPromocodeBonusExpiry = async (input: any): Promise<PromoCodeModelOutput> => {
    return await this.model.findOne(input,{ nBonusExpireDays: 1 }).lean();
  };
}
