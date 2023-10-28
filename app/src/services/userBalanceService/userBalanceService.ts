import { ObjectId } from "mongodb";
import { Literal } from "sequelize/types/utils";
import { Transaction } from "sequelize";

import UserBalanceDao from "@/src/daos/userBalance/userBalanceDaos";
import { UserBalanceOutput } from "@/models/userBalanceModel/userBalanceModel";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import StatisticDao from "@/src/daos/statistic/statisticDao";
import { PassbookStatusTypeEnums, PassbookTypeEnums } from "@/enums/passbookTypeEnums/passbookTypeEnums";
import { StatisticModelOutput } from "@/models/statisticsModel/statisticsModel";
import { AdminBalanceData, AdminBalanceDataOutput } from "@/interfaces/admin/adminBalanceData/adminBalanceData";
import { CommonRuleEnums } from "@/enums/commonRuleEnums/commonRuleEnums";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import { UserPlayDeductionQueryData } from "@/interfaces/userPlayDeduction/UserPlayDeduction";

export interface UpdateUserBalance {
  nCurrentDepositBalance?: number | Literal;
  nCurrentWinningBalance?: Literal;
  nCurrentTotalBalance?: Literal;
  nCurrentBonus?: Literal;
  nTotalDepositAmount?: Literal;
  nTotalBonusEarned?: Literal;
  nTotalDepositCount?: Literal;
}

export default class UserBalanceService {
  private userBalanceDao: UserBalanceDao;
  private statisticsDao: StatisticDao;
  private transactionDao: TransactionDao;

  constructor() {
    this.userBalanceDao = new UserBalanceDao();
    this.statisticsDao = new StatisticDao();
    this.transactionDao = new TransactionDao();
  }

  /**
   *
   * @param queryData
   * @param session
   * @returns
   */

  public adminGet = async (iUserId: string): Promise<AdminBalanceDataOutput | UserBalanceOutput> => {
    try {
      let [BalanceData, stats]: [UserBalanceOutput, StatisticModelOutput] = await Promise.all([
        this.userBalanceDao.findUserBalance(iUserId),
        this.statisticsDao.findOneAndLean(
          {
            iUserId,
          },
          {
            nTotalPlayedCash: 1,
          },
        ),
      ]);

      if (!stats) return BalanceData;

      const { nTotalPlayedCash: nTotalPlayCash } = stats;
      const response: AdminBalanceData = { ...BalanceData, ...stats, nTotalPlayCash };

      delete response.nTotalPlayedCash;
      delete response.aTotalMatch;

      return response;
    } catch (error) {
      throw error;
    }
  };

  public userPlayDeduction = async (
    queryData: UserPlayDeductionQueryData,
    session: any,
  ): Promise<{ isSuccess: boolean; nPrice: number; nActualBonus?: number }> => {
    //TODO: need to fix this return type from any to custom type.
    return this.transactionDao.userPlayDeduction(queryData, session)
  };

  /**
   *
   * @param userId string
   * @param transaction any
   * @param lock boolean
   * @returns
   */
  private findUserBalance = async (
    userId: string,
    transaction: Transaction,
    lock: boolean,
  ): Promise<UserBalanceOutput> => {
    return await this.userBalanceDao.findUserBalance(userId, transaction, lock);
  };

  /**
   *
   * @param categoryName
   * @returns
   */
  private getStatisticsSportsKey = (categoryName): string => {
    if (!CategoryTypeEnums[`${categoryName}`]) return "";
    return `o${categoryName.charAt(0).toUpperCase()}${categoryName.slice(1).toLowerCase()}`;
  };

  /**
   *
   * @param updateQueryData
   * @param userId
   * @param transaction
   */
  private updateUserBalance = async (
    updateQueryData: UpdateUserBalance,
    userId: string,
    transaction: any,
  ): Promise<void> => {
    this.userBalanceDao.updateUserBalance(updateQueryData, userId, transaction);
  };

  /**
   *
   * @param referralId ObjectId
   * @param referById string
   * @param referCode string
   * @param userName string
   * @param type UserTypeEnum
   * @param referrals number
   * @param rule CommonRuleModelOutput
   * @returns
   */
}
