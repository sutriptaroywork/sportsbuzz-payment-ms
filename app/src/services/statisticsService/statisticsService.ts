import { ObjectId } from "mongodb";
import StatisticsDao from "@/src/daos/statistic/statisticDao";
import { StatisticModelOutput } from "@/models/statisticsModel/statisticsModel";
import queryDataStatsService from "@/interfaces/queryData/queryDataInterface";
import updateStatsInterface from "@/interfaces/updateStats/updateStatsInterface";

export default class StatisticsService {
  statisticsDao: StatisticsDao;

  constructor() {
    this.statisticsDao = new StatisticsDao();
  }

  public updateUserStats = async (queryData: queryDataStatsService, session: any): Promise<void> => {
    await this.statisticsDao.updateUserBalanceStats(queryData, session);
  };

  public countDocument = async (userId: string): Promise<Number> => {
    return await this.statisticsDao.countDocument(userId);
  };

  public createUserStats = async (userId: string): Promise<void> => {
    await this.statisticsDao.createDocument(userId);
  };

}
