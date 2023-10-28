import { ObjectId } from "mongodb";
import PromoCodeStatsDao from "@/src/daos/promoCodeStats/promoCodeStatsDao";
import { UserLeagueModelOutput } from "@/models/userLeagueModel/userLeagueModel";
import { HttpException } from "@/library/HttpException/HttpException";

export default class PromoCodeStatisticService {
  private promoCodeStatsDao: PromoCodeStatsDao;

  constructor() {
    this.promoCodeStatsDao = new PromoCodeStatsDao();
  }

  public createUserPromoCodeStats = async (
    userId: string,
    promoCodeId: ObjectId,
    promoCodeDiscount: number,
    sTransactionType: string,
    matchId: ObjectId,
    matchLeagueId: string,
    userLeaguePayloadData: UserLeagueModelOutput,
  ): Promise<any> => {
    const promoCodeStats = await this.promoCodeStatsDao.createUserLeaguePromoCodeStats(
      userId,
      promoCodeId,
      promoCodeDiscount,
      sTransactionType,
      matchId,
      matchLeagueId,
      userLeaguePayloadData,
    );
    return promoCodeStats;
  };

  public clearTraces = async (promoCodeStats: any): Promise<void> => {
    this.promoCodeStatsDao.clearTraces(promoCodeStats);
  };

  public logStats = async ({
    iUserId,
    iPromocodeId,
    sTransactionType,
    nAmount,
    idepositId,
  }): Promise<{ isSuccess: true }> => {
    try {
      await this.promoCodeStatsDao.create({ iUserId, iPromocodeId, sTransactionType, nAmount, idepositId });
      return { isSuccess: true };
    } catch (error) {
      throw new HttpException(error.status, error.message);
    }
  };
}
