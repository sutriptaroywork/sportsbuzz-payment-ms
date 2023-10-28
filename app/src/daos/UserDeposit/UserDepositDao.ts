import UserDepositModel, { UserDepositInput, UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import BaseSqlDao from "../baseSqlDao";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { IntegerDataType, Op, Transaction } from "sequelize";
import { HttpException } from "@/library/HttpException/HttpException";
import { StatusCodeEnums, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { CashfreeDepositStatusPayload } from "@/interfaces/cashfreeDepositStatusPayload/cashfreeDepositStatusPayload";
import { UserDepositAdminList } from "@/interfaces/userDeposit/userDepositInterface";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";

export default class UserDepositDao extends BaseSqlDao<UserDepositInput, UserDepositOutput> {

  constructor() {
    super(UserDepositModel);
  }

  public findExistingDeposit = async (id: number| IntegerDataType,t: Transaction): Promise<UserDepositOutput> => {
    return await this.model.findOne({ where: { id }, order: [["id", "DESC"]], raw: true, transaction: t, lock: true});
  }

  public findUserDepositByOrderId = async (iOrderId: string): Promise<UserDepositOutput> => {
    return await this.model.findOne({ where: { iOrderId }, raw: true });
  };

  public findUserDeposit = async (params: CashfreeDepositStatusPayload): Promise<UserDepositOutput> => {
    return await this.model.findOne({ where: params, attributes: ["id", "iOrderId", "ePaymentGateway", "ePaymentStatus"], order:[["id", "DESC"]]
    });
  }

  public depositCounts = async (payload: UserDepositAdminList) : Promise<number> => {
    try {
      const { datefrom, dateto, isFullResponse, query } = payload;

      if (datefrom && dateto) {
        query.push({ dCreatedAt: { [Op.gte]: datefrom } });
        query.push({ dCreatedAt: { [Op.lte]: dateto } });
      }
      if ([true, "true"].includes(isFullResponse)) query.push({ eUserType: UserTypeEnums.USER });

      return await this.model.count({
        where: {
          [Op.and]: query,
        },
        raw: true,
      });
    } catch (error) { throw error }
  }

  

  public findPendingDeposits = async (): Promise<UserDepositOutput[]> => {
    const dCurrentTime = new Date()
    dCurrentTime.setTime(dCurrentTime.getTime() - (24 * 60 * 60 * 1000)) // last 24 hours
    return await this.model.findAll({
          where: {
            ePaymentGateway: { [Op.in]: [paymentGatewayEnums.CASHFREE, paymentGatewayEnums.JUSPAY, paymentOptionEnums.CASHFREE_UPI] },            
            ePaymentStatus: paymentStatusEnum.PENDING,
            [Op.and]: [
              {
                dUpdatedAt: { [Op.gte]: dCurrentTime },
              },
              {
                dUpdatedAt: { [Op.lte]: new Date(new Date().getTime() - 5 * 60 * 1000) }, // 5 minutes before from current time.
              },
            ],
          },
          raw: true,
          attributes: ["id", "ePaymentGateway", "iOrderId", "iUserId", "nCash", "nBonus"],
          order: [["dUpdatedAt", "DESC"]]
    });
  };


  public findAndCountByDate = async ({
    iUserId,
    currentDate,
    fromDate,
  }: {
    iUserId: string;
    currentDate: string;
    fromDate: string;
  }): Promise<{ count: any; rows: any }> => {
    return await this.model.findAndCountAll({
      where: {
        iUserId,
        ePaymentStatus: paymentStatusEnum.PENDING,
        dCreatedAt: {
          [Op.lte]: currentDate,
          [Op.gte]: fromDate,
        },
      },
    });
  };

  public adminList = async (payload : UserDepositAdminList) : Promise<UserDepositOutput[]> => {
    try {
      let { datefrom, dateto, start = 0, limit = 10, sort = "dCreatedAt", order,isFullResponse, query } = payload;
      const orderBy = order && order === "asc" ? "ASC" : "DESC";

      if ((!datefrom || !dateto) && [true, "true"].includes(isFullResponse)) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.date_filter_err);
      }
      if ([true, "true"].includes(isFullResponse)) query.push({ eUserType: UserTypeEnums.USER });

      if (datefrom && dateto) {
        query.push({ dCreatedAt: { [Op.gte]: datefrom } });
        query.push({ dCreatedAt: { [Op.lte]: dateto } });
      }
      const paginationFields = [true, "true"].includes(isFullResponse)
        ? {}
        : {
            offset: parseInt(start),
            limit: parseInt(limit),
          };

      const data : UserDepositOutput[] = await this.model.findAll({
        where: {
          [Op.and]: query,
        },
        order: [[sort, orderBy]],
        ...paginationFields,
        raw: true,
      });

      return data;
    } catch (error) {
      throw error
    }
  }

  /* private processDeposit = async (iUserId: string, sPromocode?: string): Promise<any> => {
    try {
      const user = await this.userDao.findById(iUserId);
      return sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: any): Promise<UserDepositOutput | Object> => {
          let paymentStatus = "P";
          let promocodeId;
          let promocodes;
          let nOldBonus = 0;
          let nOldTotalBalance = 0;
          let nOldDepositBalance = 0;
          let nOldWinningBalance = 0;
          let eUserType = user.eType;
          let userDeposit;

          const iOrderId = randomIdgenerator(10);
          const iTransactionId = randomIdgenerator(10);
          if (sPromocode) {
            const { count: allCount } = await this.userDepositDao.findAndCountAll({
              where: { iPromocodeId: promocodeId, ePaymentStatus: { [Op.in]: ["P", "S"] } },
              transaction: t,
              lock: true,
            });
            const { count } = await this.userDepositDao.findAndCountAll({
              where: { iUserId, iPromocodeId: promocodeId, ePaymentStatus: { [Op.in]: ["P", "S"] } },
              transaction: t,
              lock: true,
            });
            if (!promocodes.bMaxAllowForAllUser && count >= promocodes.nMaxAllow) {
              return { status: StatusCodeEnums.NOT_FOUND, message: "Promocode max usage limit reached!" };
            } else if (allCount >= promocodes.nMaxAllow || count >= promocodes.nPerUserUsage) {
              return { status: StatusCodeEnums.NOT_FOUND, message: "Promocode max usage limit reached!" };
            }
            userDeposit = await this.userDepositDao.create(
              {
                iUserId,
                nAmount: nDeposit,
                nCash,
                nBonus,
                sInfo: `Deposit of ₹${nAmount}`,
                iPromocodeId: promocodeId,
                iOrderId,
                sPromocode: sPromocode.toUpperCase(),
              },
              { transaction: t, lock: true },
            );
          } else {
            userDeposit = await this.userDepositDao.create(
              {
                iUserId,
                nAmount: nDeposit,
                nCash,
                sOrderId,
                ePaymentStatus: paymentStatusEnum.PENDING,
                nBonus,
                sInfo: `Deposit of ₹${nAmount}`,
              },
              { transaction: t, lock: true },
            );
          }

          if (user.bIsInternalAccount === true) {
            paymentStatus = "S";
            const oldBalance = await this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true });
            if (oldBalance) {
              const { nCurrentBonus, nCurrentTotalBalance, nCurrentDepositBalance, nCurrentWinningBalance } =
                oldBalance;
              nOldBonus = nCurrentBonus;
              nOldTotalBalance = nCurrentTotalBalance;
              nOldDepositBalance = nCurrentDepositBalance;
              nOldWinningBalance = nCurrentWinningBalance;
            } else {
              await this.userBalanceDao.create({ iUserId, eUserType }, { transaction: t, lock: true });
            }

            let dBonusExpiryDate;
            if (userDeposit.iPromocodeId) {
              const promocode = await this.promocodeDao.findOneAndLean(
                { eStatus: "Y", _id: userDeposit.iPromocodeId.toString() },
                { nBonusExpireDays: 1 },
              );

              const { nBonusExpireDays = 0 } = promocode;
              dBonusExpiryDate = new Date();
              dBonusExpiryDate.setDate(dBonusExpiryDate.getDate() + nBonusExpireDays);
            } else {
              dBonusExpiryDate = null;
            }

            await this.userBalanceDao.update(
              {
                nCurrentDepositBalance: literal(`nCurrentDepositBalance + ${nCash}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${nCash}`),
                nTotalDepositAmount: literal(`nTotalDepositAmount + ${nCash}`),
                nTotalBonusEarned: literal(`nTotalBonusEarned + ${nBonus}`),
                nCurrentBonus: literal(`nCurrentBonus + ${nBonus}`),
                nTotalDepositCount: literal("nTotalDepositCount + 1"),
              },
              {
                where: { iUserId },
                transaction: t,
                lock: true,
              },
            );

            await Promise.all([
              this.passbookDao.create(
                {
                  iUserId,
                  nAmount,
                  nCash,
                  nBonus,
                  eUserType,
                  dBonusExpiryDate,
                  nOldBonus,
                  nOldTotalBalance,
                  nOldDepositBalance,
                  nOldWinningBalance,
                  eTransactionType: "Deposit",
                  iUserDepositId: userDeposit.id,
                  eType: "Cr",
                  sRemarks: "Deposit Approved.",
                  eStatus: "CMP",
                },
                { transaction: t, lock: true },
              ),
              this.statisticsDao.updateOne(
                { iUserId: new ObjectId(iUserId) },
                {
                  $inc: {
                    nActualDepositBalance: Number(parseFloat(`${nCash}`).toFixed(2)),
                    nActualBonus: Number(parseFloat(`${nBonus}`).toFixed(2)),
                    nDeposits: Number(parseFloat(`${nCash}`).toFixed(2)),
                    nCash: Number(parseFloat(`${nCash}`).toFixed(2)),
                    nBonus: Number(parseFloat(`${nBonus}`).toFixed(2)),
                    nDepositCount: 1,
                  },
                },
                { upsert: true },
              ),
            ]);
          }
          return userDeposit;
        },
      );
    } catch (error) {
      throw new HttpException(error.status, error.message);
    }
  }; */
}