import BaseSqlDao from "../baseSqlDao";
import UserBalance, { UserBalanceInput, UserBalanceOutput } from "@/models/userBalanceModel/userBalanceModel";
import { Op, Transaction, literal } from "sequelize";
import { UpdateUserBalance } from "@/src/services/userBalanceService/userBalanceService";
import { queuePush } from "@/helpers/helper_functions";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { TransactionTypeEnums } from "@/enums/transactionTypeEnums/transactionTypesEnums";
import { payoutStatusEnums } from "@/enums/payoutStatusEnums/payoutStatusEnums";
import withdrawNotificationPublish from "@/connections/rabbitmq/queue/withdrawalNotification";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import sequelizeConnection from "@/connections/database/mysql/mysql";

export default class UserBalanceDao extends BaseSqlDao<UserBalanceInput, UserBalanceOutput> {
  constructor() {
    super(UserBalance);
  }

  /**
   *
   * @param userId
   * @param transaction
   * @param lock
   * @returns
   */
  public findUserBalance = async (userId: string, transaction?: any, lock?: boolean): Promise<UserBalanceOutput> => {
    //TODO: need to add a type in transaction parameter later.
    return await this.model.findOne({
      where: { iUserId: userId },
      plain: true,
    });
  };

  /**
   *
   * @param userId
   * @param transaction
   * @param lock
   * @param price
   * @param actualBonus
   */
  public updateUserBalanceAfterContestJoin = async (
    userId: string,
    transaction: any,
    lock: boolean,
    price: number,
    actualBonus: number,
  ): Promise<void> => {
    await this.model.update(
      {
        nCurrentWinningBalance: literal(`nCurrentWinningBalance - ${price}`),
        nCurrentTotalBalance: literal(`nCurrentTotalBalance - ${price}`),
        nCurrentBonus: literal(`nCurrentBonus - ${actualBonus}`),
      },
      {
        where: { userId },
        transaction: transaction,
        lock: lock,
      },
    );
  };

  public updateUserBalance = async (
    updateQueryData: UpdateUserBalance,
    userId: string,
    transaction: any,
  ): Promise<void> => {
    await this.model.update(
      {
        ...updateQueryData,
      },
      { where: { iUserId: userId }, transaction: transaction, lock: true },
    );
  };

  public findCurrentWinningBalance = async (UserId: string): Promise<UserBalanceOutput> => {
    return await this.model.findOne({ where: { iUserId: UserId }, attributes: ["nCurrentWinningBalance"], raw: true });
  };

}
