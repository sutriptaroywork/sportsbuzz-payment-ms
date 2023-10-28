import { ObjectId } from "mongodb";
import BaseMongoDao from "../baseMongoDao";
import queryDataStatsService from "@/interfaces/queryData/queryDataInterface";
import StatisticModel, { StatisticModelInput, StatisticModelOutput } from "@/models/statisticsModel/statisticsModel";
import updateStatsInterface from "@/interfaces/updateStats/updateStatsInterface";

export default class StatisticDao extends BaseMongoDao<StatisticModelInput, StatisticModelOutput> {
  constructor() {
    super(StatisticModel);
  }

  /**
   *
   * @param queryData
   * @param session
   */
  public updateUserBalanceStats = async (queryData: queryDataStatsService, session: any): Promise<void> => {
    const iUserId = queryData.userId,
      iMatchId = queryData.matchId,
      matchCategory = queryData.matchCategory,
      leagueJoinAmount = queryData.leagueJoinAmount,
      nCash = queryData.nCash,
      nWin = queryData.nWin,
      nActualBonus = queryData.nActualBonus,
      nPrice = queryData.nPrice,
      nPromoDiscount = queryData.nPromoDiscount,
      leagueTypeStat = queryData.leagueTypeStat,
      query = queryData.query;

    await this.model
      .updateOne(
        { iUserId: new ObjectId(iUserId) },
        {
          $inc: {
            nTotalJoinLeague: 1,
            [`${matchCategory}.nSpending`]: Number(parseFloat(leagueJoinAmount.toString()).toFixed(2)),
            [`${matchCategory}.nSpendingCash`]: Number(parseFloat((nCash + nWin).toString()).toFixed(2)),
            nActualWinningBalance: -Number(parseFloat(nWin.toString()).toFixed(2)),
            nActualBonus: -Number(parseFloat(nActualBonus.toString()).toFixed(2)),
            nTotalPlayedCash: Number(parseFloat(nPrice.toString()).toFixed(2)),
            nTotalPlayedBonus: Number(parseFloat(nActualBonus.toString()).toFixed(2)),
            nWinnings: -Number(parseFloat(nWin.toString()).toFixed(2)),
            [`${matchCategory}.nSpendingBonus`]: Number(parseFloat(nActualBonus.toString()).toFixed(2)),
            [`${matchCategory}.nDiscountAmount`]: Number(parseFloat(nPromoDiscount.toString()).toFixed(2)),
            ...leagueTypeStat,
          },
          $addToSet: {
            [`${matchCategory}.aMatchPlayed`]: {
              iMatchId: new ObjectId(iMatchId),
            },
            aTotalMatch: { iMatchId: new ObjectId(iMatchId) },
          },
          ...query,
        },
        { upsert: true },
      )
      .session(session);
  };

  /**
   *
   * @param userId
   * @returns
   */
  public countDocument = async (userId: string): Promise<Number> => {
    return await this.model.countDocuments({
      iUserId: new ObjectId(userId),
    });
  };

  public updateStats = async (payload: updateStatsInterface): Promise<void> => {
    const { iUserId, nReferrals, nBonus, nCash } = payload;
    // TODO-ISSUE DAO's code
    await this.model.updateOne(
      { iUserId: new ObjectId(iUserId) },
      {
        $inc: {
          nReferrals: nReferrals ? 1 : 0,
          nActualBonus: nBonus,
          nActualDepositBalance: nCash,
          // nDeposits: Number(parseFloat(nCash).toFixed(2)),
          nCash,
          nBonus,
          // nDepositCount: nCount
        },
      },
      { upsert: true },
    );
  };


  public createDocument = async (userId: string): Promise<void> => {
    await this.model.create({
      iUserId: new ObjectId(userId),
    });
  };
}
