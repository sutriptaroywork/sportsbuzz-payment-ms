import { IntegerDataType, Op, Transaction, literal } from "sequelize";
import sequelizeConnection from "@/connections/database/mysql/mysql";
import uuid from "uuid-random";
import bcrypt from "bcryptjs";
import { StatusCodeEnums, messagesEnglish, promoCodeStats } from "@/enums/commonEnum/commonEnum";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import UserDepositDao from "../UserDeposit/UserDepositDao";
import { UpdateUserBalance } from "@/src/services/userBalanceService/userBalanceService";
import { CommonRuleEnums } from "@/enums/commonRuleEnums/commonRuleEnums";
import { PassbookStatusTypeEnums, PassbookTypeEnums } from "@/enums/passbookTypeEnums/passbookTypeEnums";
import StatisticDao from "../statistic/statisticDao";
import PassbookDao from "../passbook/passbookDao";
import UserBalanceDao from "../userBalance/userBalanceDaos";
import { CashbackTypeEnums } from "@/enums/cashbackTypeEnums/cashbackTypeEnums";
import queryDataStatsService from "@/interfaces/queryData/queryDataInterface";
import { CategoryTypeEnums } from "@/enums/categoryTypeEnums/categoryTypeEnums";
import { UserPlayDeductionQueryData } from "@/interfaces/userPlayDeduction/UserPlayDeduction";
import paymentStatusHandling from "@/interfaces/paymentStatusHandling/paymentStatusHandling";
import depositNotificationPublish from "@/connections/rabbitmq/queue/depositNotification";
import PromoCodeDao from "../promoCode/promoCodeDao";
import Flatted from "flatted";
import { TransactionTypeEnums } from "@/enums/transactionTypeEnums/transactionTypesEnums";
import { ObjectId } from "mongodb";
import { DistributeReferralBonusPayload } from "@/interfaces/distributeReferralBonus/distributeReferralBonus";
import UserDao from "../user/userDaos";
import CommonRuleDao from "../commonRule/commonRuleDao";
import updateBalance from "@/interfaces/updateBalance/updateBalanceInterface";
import { UserStatusEnums } from "@/enums/userStatusEnums/userStatusEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { convertToDecimal, queuePush, randomIdgenerator } from "@/helpers/helper_functions";
import deductTDSInterface from "@/interfaces/deductTDS/deductTDS";
import UserTDSDao from "../tds/tdsDao";
import { HttpException } from "@/library/HttpException/HttpException";
import { promocodeHandling } from "@/interfaces/promocodeHandlingInterface/promocodeHandlingInterface";
import { depositPayloadInterface } from "@/interfaces/depositPayload/depositPayloadInterface";
import { publishAdminLogs } from "@/connections/rabbitmq/queue/adminLogQueue";
import { logTypeEnums } from "@/enums/logTypeTnums/logTypeEnums";
import { redisClient } from "@/connections/redis/redis";
import {
  CreateAdminDepositPayload,
  processAdminDepositPayload,
} from "@/interfaces/processAdminDeposit/processAdminDeposit";
import PromoCodeStatsDao from "../promoCodeStats/promoCodeStatsDao";
import { credentialDao } from "../credentialDao/credentialDao";
import { payoutStatusEnums } from "@/enums/payoutStatusEnums/payoutStatusEnums";
import { processWithdrawInterface } from "@/interfaces/processWithdraw/processWithdraw";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import userWithdrawDao from "../userWithdraw/userWithdrawDao";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { adminWithdrawInterface } from "@/interfaces/admin/adminWithdraw/adminWithdraw";
import withdrawNotificationPublish from "@/connections/rabbitmq/queue/withdrawalNotification";
import { REJECT_REASON_ENUMS } from "@/enums/rejectReasonEnums/rejectReasonEnums";
import { tdsStatusEnums } from "@/enums/tdsStatusEnums/tdsStatusEnums";
import { userWithdrawOutput } from "@/models/userWithdrawModel/userWithdrawModel";
import payoutProcessInterface from "@/interfaces/payoutProcess/payoutProcessInterface";
import { UserBalanceOutput } from "@/models/userBalanceModel/userBalanceModel";
import moment from "moment";
import { CalculateTDSResponse } from "@/interfaces/tds/adminTDSList/adminTDSList";
import settingsDao from "../settingsDao/settingsDao";
import publishTransaction from "@/connections/rabbitmq/queue/transactionLogQueue";
import { cashfreePathEnums } from "@/enums/cashfreePathEnums/cashfreePathEnums";
import axios from "axios";
import { depositTypeEnums } from "@/enums/depositType/depositTypeEnums";
import { settingsEnums } from "@/enums/settingsEnums/settingsEnums";
import { sKeyEnums } from "@/enums/sKeyEnums/sKeyEnums";
import { cashfreePayoutEnums } from "@/enums/cashfreePayout/cashfreePayoutEnums";
import { pushTypeEnums } from "@/enums/pushType/pushTypeEnums";
import { PromoCodeTypesEnums } from "@/enums/promoCodeTypeEnums/promoCodeTypeEnums";
import { oGST } from "@/interfaces/gst/calculateGSTResponse";

export default class TransactionDao {
  private userDao: UserDao;
  private userBalanceDao: UserBalanceDao;
  private userDepositDao: UserDepositDao;
  private userWithdrawDao: userWithdrawDao;
  private settingsDao: settingsDao;
  private statisticsDao: StatisticDao;
  private passbookDao: PassbookDao;
  private promocodeDao: PromoCodeDao;
  private promocodeStatsDao: PromoCodeStatsDao;
  private commonRuleDao: CommonRuleDao;
  private credentialDao: credentialDao;
  private tdsDao: UserTDSDao;

  constructor() {
    this.userDao = new UserDao();
    this.userBalanceDao = new UserBalanceDao();
    this.userDepositDao = new UserDepositDao();
    this.userWithdrawDao = new userWithdrawDao();
    this.settingsDao = new settingsDao();
    this.statisticsDao = new StatisticDao();
    this.passbookDao = new PassbookDao();
    this.promocodeDao = new PromoCodeDao();
    this.promocodeStatsDao = new PromoCodeStatsDao();
    this.commonRuleDao = new CommonRuleDao();
    this.credentialDao = new credentialDao();
    this.tdsDao = new UserTDSDao();
  }

  public processPayment = async ({
    deposit,
    payload,
    oGST
  }: {deposit: UserDepositOutput, payload: any, oGST: oGST}): Promise<{
    alreadySuccess: boolean;
    status: StatusCodeEnums;
    message: string;
    ePaymentStatus: paymentStatusEnum;
  }> => {
    try {
      const transactionResponse = await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          const existingDeposit = await this.userDepositDao.findExistingDeposit(deposit.id, t);
          
          if (existingDeposit?.ePaymentStatus) deposit.ePaymentStatus = existingDeposit.ePaymentStatus;

          const { iUserId, nCash = 0, nBonus = 0, nAmount, eUserType } = existingDeposit;

          const { payment_status: ePaymentStatus, cf_payment_id: referenceId } = payload[0] || {};
          const paymentStatusPayload = {
            iUserId,
            t,
            deposit,
            nCash,
            nBonus,
            nAmount,
            eUserType,
            oGST,
            paymentStatus: ePaymentStatus,
            referenceId,
          };
          const paymentHandleResponse = await this.paymentStatusHandling(paymentStatusPayload);
          return paymentHandleResponse;
        },
      );
      return transactionResponse;
    } catch (error) {
      throw error;
    }
  };

  public userDepositUpdateBalance = async (
    payload: updateBalance,
  ): Promise<{
    alreadySuccess: boolean;
    status: StatusCodeEnums;
    message: string;
    ePaymentStatus: paymentStatusEnum;
  }> => {
    try {
      let { txStatus: ePaymentStatus, deposit, referenceId, oGST } = payload;
      if (ePaymentStatus === paymentStatusEnum.PAID || paymentStatusEnum.SUCCESS)
        ePaymentStatus = paymentStatusEnum.SUCCESS;
      return await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          const { iUserId, nCash = 0, nBonus = 0, nAmount, eUserType } = deposit;

          const paymentStatusPayload = {
            iUserId,
            t,
            deposit,
            nCash,
            nBonus,
            nAmount,
            eUserType,
            oGST,
            paymentStatus: ePaymentStatus,
            referenceId,
          };
          console.log('flow test 0')
          return await this.paymentStatusHandling(paymentStatusPayload);
        },
      );
    } catch (error) {
      throw error;
    }
  };

  public paymentStatusHandling = async (
    payload: paymentStatusHandling,
  ): Promise<{
    alreadySuccess: boolean;
    status: StatusCodeEnums;
    message: string;
    ePaymentStatus: paymentStatusEnum;
  }> => {
    console.log('flow test')
    try {
      const { iUserId, nCash = 0, nBonus = 0, nAmount, eUserType, deposit, oGST, paymentStatus, referenceId, t } = payload;

      if (payload.deposit.ePaymentStatus !== paymentStatusEnum.PENDING) {
        // TODO-ISSUE use proper enums, and maintain indentation
        console.log('paymentStatusHandling payment & success cancel 0')
        if (deposit.ePaymentStatus === paymentStatusEnum.CANCELLED && paymentStatus === paymentStatusEnum.SUCCESS) {
          console.log('paymentStatusHandling payment & success cancel 1')
          let dBonusExpiryDate = new Date();
          if (deposit.sPromocode) {
            const promocode = await this.promocodeDao.findOneAndLean(
              { sCode: deposit.sPromocode.toUpperCase() },
              { nBonusExpireDays: 1 },
            );
            const { nBonusExpireDays = 0 } = promocode;
            if (nBonusExpireDays) {
              dBonusExpiryDate.setDate(dBonusExpiryDate.getDate() + nBonusExpireDays);
              dBonusExpiryDate.setUTCHours(23, 59); // 23:59 EOD
            } else {
              dBonusExpiryDate = null;
            }
          } else {
            dBonusExpiryDate = null;
          }

          // Update User Deposit details based on deposit-id or iOrderId - Entire Deposit payload updating as sInfo
          // TODO-ISSUE move transaction related code to DAO
          const [updateDepositResult, oldBalance] = await Promise.all([
            this.userDepositDao.update(
              {
                ePaymentStatus: paymentStatusEnum.SUCCESS,
                nBonus: oGST.nGSTAmount,
                sInfo: Flatted.stringify(payload),
                iTransactionId: referenceId,
                iOrderId: payload.deposit.iOrderId,
                dProcessedDate: new Date(),
              },
              { where: { id: deposit.id }, transaction: t, lock: true },
            ),
            this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true }),
          ]);

          const {
            nCurrentBonus: nOldBonus,
            nCurrentTotalBalance: nOldTotalBalance,
            nCurrentDepositBalance: nOldDepositBalance,
            nCurrentWinningBalance: nOldWinningBalance,
          } = oldBalance;

          // TODO-ISSUE move each query to DAO and maintain proper indentation
          console.log('test')
          await Promise.all([
            this.userBalanceDao.update(
              {
                nCurrentDepositBalance: literal(`nCurrentDepositBalance + ${oGST.nAmountAfterGST}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${oGST.nAmountAfterGST}`),
                nTotalDepositAmount: literal(`nTotalDepositAmount + ${oGST.nAmountAfterGST}`),
                nTotalBonusEarned: literal(`nTotalBonusEarned + ${oGST.nGSTAmount}`),
                nCurrentBonus: literal(`nCurrentBonus + ${oGST.nGSTAmount}`),
                nTotalDepositCount: literal("nTotalDepositCount + 1"),
              },
              {
                where: { iUserId },
                transaction: t,
                lock: true,
              },
            ),
            this.passbookDao.create(
              {
                iUserId,
                    nAmount : oGST.nAmountAfterGST,
                nCash : oGST.nAmountAfterGST,
                nBonus : oGST.nGSTAmount,
                eUserType,
                dBonusExpiryDate,
                nOldBonus,
                nOldTotalBalance,
                nOldDepositBalance,
                nOldWinningBalance,
                eTransactionType: TransactionTypeEnums.DEPOSIT,
                iUserDepositId: deposit.id,
                eType: PassbookTypeEnums.CREDITED,
                sRemarks: "Amount has been deposited successfully",
                dActivityDate: new Date(),
                iTransactionId: referenceId,
                sPromocode: deposit.sPromocode,
                eStatus: PassbookStatusTypeEnums.COMPLETED,
              },
              { transaction: t, lock: true },
            ),
                        console.log('GST updated passbook'),


            this.passbookDao.create({ iUserId, nAmount: oGST.nGSTAmount, eUserType, nOldBonus, nOldTotalBalance, nOldDepositBalance, nOldWinningBalance,iUserDepositId: deposit.id, eTransactionType: TransactionTypeEnums.GST, eType: PassbookTypeEnums.DEBITED, sRemarks: `You have paid ${oGST.nGSTAmount} ₹ as GST on the deposit of ${oGST.nRequestedAmount} ₹`, dActivityDate: new Date(), eStatus: PassbookStatusTypeEnums.COMPLETED }, { transaction: t, lock: true }),
            this.statisticsDao.updateOne(
              { iUserId: new ObjectId(iUserId) },
              {
                $inc: {
                  nActualBonus: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  nActualDepositBalance: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nDeposits: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nCash: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nBonus: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  nDepositCount: 1,
                  nDepositDiscount: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                },
              },
              { upsert: true },
            ),
          ]);
          //await queuePush('pushNotification:Deposit', { iUserId, ePaymentStatus: paymentStatusEnum.SUCCESS, sPushType: 'Transaction' })
          // TODO-ISSUE what this function do??
          await depositNotificationPublish({
            iUserId,
            ePaymentStatus: paymentStatusEnum.SUCCESS,
            sPushType: pushTypeEnums.TRANSACTION,
          });
          const referralPayload = { iUserId, t, updateDepositResult };
          return await this.distributeReferralBonus(referralPayload);
        } else {
          console.log('paymentStatusHandling payment & success cancel 2')
          return {
            alreadySuccess: true,
            status: StatusCodeEnums.OK,
            message: messagesEnglish.action_success.replace("##", messagesEnglish.cDepositHasBeenMade),
            ePaymentStatus: payload.deposit.ePaymentStatus,
          };
        }
      } else {
                  console.log('paymentStatusHandling payment & success cancel 2.0')

        if (paymentStatus === paymentStatusEnum.SUCCESS) {
          console.log('paymentStatusHandling payment & success cancel 2.1')

          let dBonusExpiryDate = new Date();
          if (deposit.sPromocode) {
            const promocode = await this.promocodeDao.findOneAndLean(
              { sCode: deposit.sPromocode.toUpperCase() },
              { nBonusExpireDays: 1 },
            );
            const { nBonusExpireDays = 0 } = promocode;
            if (nBonusExpireDays) {
              dBonusExpiryDate.setDate(dBonusExpiryDate.getDate() + nBonusExpireDays);
            } else {
              dBonusExpiryDate = null;
            }

            const [updateDepositResult, oldBalance] = await Promise.all([
              this.userDepositDao.update(
                {
                  ePaymentStatus: paymentStatusEnum.SUCCESS,
                  sInfo: Flatted.stringify(payload),
                  iTransactionId: referenceId,
                  iOrderId: payload.deposit.iOrderId,
                  dProcessedDate: new Date(),
                },
                { where: { id: deposit.id }, transaction: t, lock: true },
              ),
              this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true }),
            ]);

            const {
              nCurrentBonus: nOldBonus,
              nCurrentTotalBalance: nOldTotalBalance,
              nCurrentDepositBalance: nOldDepositBalance,
              nCurrentWinningBalance: nOldWinningBalance,
            } = oldBalance;
          console.log('test 1')
   

          await Promise.all([
            this.userBalanceDao.update(
              {
                nCurrentDepositBalance: literal(`nCurrentDepositBalance + ${oGST.nAmountAfterGST}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${oGST.nAmountAfterGST}`),
                nTotalDepositAmount: literal(`nTotalDepositAmount + ${oGST.nAmountAfterGST}`),
                nTotalBonusEarned: literal(`nTotalBonusEarned + ${oGST.nGSTAmount}`),
                nCurrentBonus: literal(`nCurrentBonus + ${oGST.nGSTAmount}`),
                nTotalDepositCount: literal("nTotalDepositCount + 1"),
              },
                {
                  where: { iUserId },
                  transaction: t,
                  lock: true,
                },
              ),
              this.passbookDao.create(
                {
                  iUserId,
                     nAmount : oGST.nAmountAfterGST,
                nCash : oGST.nAmountAfterGST,
                nBonus : oGST.nGSTAmount,
                  eUserType,
                  dBonusExpiryDate,
                  nOldBonus,
                  nOldTotalBalance,
                  nOldDepositBalance,
                  nOldWinningBalance,
                  eTransactionType: TransactionTypeEnums.DEPOSIT,
                  iUserDepositId: deposit.id,
                  eType: PassbookTypeEnums.CREDITED,
                  sRemarks: "Amount has been deposited successfully",
                  dActivityDate: new Date(),
                  iTransactionId: referenceId,
                  sPromocode: deposit.sPromocode,
                  eStatus: PassbookStatusTypeEnums.COMPLETED,
                },
                { transaction: t, lock: true },
              ),
                          console.log('GST updated passbook'),

              this.passbookDao.create({ iUserId, nAmount: oGST.nGSTAmount, eUserType,dBonusExpiryDate, nOldBonus, nOldTotalBalance, nOldDepositBalance, nOldWinningBalance,iUserDepositId: deposit.id, eTransactionType: TransactionTypeEnums.GST, eType: PassbookTypeEnums.DEBITED, sRemarks: `You have paid ${oGST.nGSTAmount} ₹ as GST on the deposit of ${oGST.nRequestedAmount} ₹`, dActivityDate: new Date(), eStatus: PassbookStatusTypeEnums.COMPLETED }, { transaction: t, lock: true }),
              this.statisticsDao.updateOne(
                { iUserId: new ObjectId(iUserId) },
                {
                  $inc: {
                   nActualBonus: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  nActualDepositBalance: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nDeposits: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nCash: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nBonus: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  nDepositCount: 1,
                  nDepositDiscount: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  },
                },
                { upsert: true },
              ),
            ]);
            // await queuePush('pushNotification:Deposit', { iUserId, ePaymentStatus: paymentStatusEnum.SUCCESS, sPushType: 'Transaction' })
            await depositNotificationPublish({
              iUserId,
              ePaymentStatus: paymentStatusEnum.SUCCESS,
              sPushType: pushTypeEnums.TRANSACTION,
            });
            const referralPayload = { iUserId, t, updateDepositResult };
            return await this.distributeReferralBonus(referralPayload);
          } else if (deposit.ePaymentStatus !== paymentStatusEnum.SUCCESS) {
            console.log('paymentStatusHandling payment & success cancel 2.2')
            const { paymentStatus: ePaymentStatus, deposit: existingDeposit } = payload;
            if (ePaymentStatus === paymentStatusEnum.SUCCESS) {
              let dBonusExpiryDate = new Date();
              if (deposit.sPromocode) {
                const promocode = await this.promocodeDao.findOneAndLean(
                  { sCode: deposit.sPromocode.toUpperCase() },
                  { nBonusExpireDays: 1 },
                );
                const { nBonusExpireDays = 0 } = promocode;
                if (nBonusExpireDays) {
                  dBonusExpiryDate.setDate(dBonusExpiryDate.getDate() + nBonusExpireDays);
                  dBonusExpiryDate.setUTCHours(23, 59); // 23:59 EOD
                } else {
                  dBonusExpiryDate = null;
                }
              } else {
                dBonusExpiryDate = null;
              }
              // Update User Deposit details based on deposit-id or iOrderId  - Entire Deposit payload updating as sInfo
              const updateDepositResult = await this.userDepositDao.update(
                {
                  ePaymentStatus: paymentStatusEnum.SUCCESS,
                  sInfo: JSON.stringify(deposit),
                  iTransactionId: referenceId,
                  dProcessedDate: new Date(),
                },
                { where: { id: existingDeposit.id }, transaction: t, lock: true },
              );
              const oldBalance = await this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true });
              const referralPayload = { iUserId, t, updateDepositResult };

              const {
                nCurrentBonus: nOldBonus,
                nCurrentTotalBalance: nOldTotalBalance,
                nCurrentDepositBalance: nOldDepositBalance,
                nCurrentWinningBalance: nOldWinningBalance,
              } = oldBalance;
                        console.log('test 2')
          await Promise.all([
            this.userBalanceDao.update(
              {
                nCurrentDepositBalance: literal(`nCurrentDepositBalance + ${oGST.nAmountAfterGST}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${oGST.nAmountAfterGST}`),
                nTotalDepositAmount: literal(`nTotalDepositAmount + ${oGST.nAmountAfterGST}`),
                nTotalBonusEarned: literal(`nTotalBonusEarned + ${oGST.nGSTAmount}`),
                nCurrentBonus: literal(`nCurrentBonus + ${oGST.nGSTAmount}`),
                nTotalDepositCount: literal("nTotalDepositCount + 1"),
              },
                  {
                    where: { iUserId },
                    transaction: t,
                    lock: true,
                  },
                ),
                // need to change dBonusExpiryDate : 11:59 date.setUTCHours(23,59)
                this.passbookDao.create(
                  {
                    iUserId,
                    nAmount : oGST.nAmountAfterGST,
                nCash : oGST.nAmountAfterGST,
                nBonus : oGST.nGSTAmount,
                    dBonusExpiryDate,
                    nOldBonus,
                    nOldTotalBalance,
                    nOldDepositBalance,
                    nOldWinningBalance,
                    eTransactionType: TransactionTypeEnums.DEPOSIT,
                    iUserDepositId: deposit.id,
                    eType: PassbookTypeEnums.CREDITED,
                    sRemarks: "Amount has been deposited successfully",
                    dActivityDate: new Date(),
                    iTransactionId: referenceId,
                    eStatus: PassbookStatusTypeEnums.COMPLETED,
                  },
                  { transaction: t, lock: true },
                ),
                            console.log('GST updated passbook'),

                this.passbookDao.create({ iUserId, nAmount: oGST.nGSTAmount, eUserType,dBonusExpiryDate, nOldBonus, nOldTotalBalance, nOldDepositBalance, nOldWinningBalance,iUserDepositId: deposit.id, eTransactionType: TransactionTypeEnums.GST, eType: PassbookTypeEnums.DEBITED, sRemarks: `You have paid ${oGST.nGSTAmount} ₹ as GST on the deposit of ${oGST.nRequestedAmount} ₹`, dActivityDate: new Date(), eStatus: PassbookStatusTypeEnums.COMPLETED }, { transaction: t, lock: true }),
                this.statisticsDao.updateOne(
                  { iUserId: new ObjectId(iUserId) },
                  {
                    $inc: {
                   nActualBonus: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  nActualDepositBalance: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nDeposits: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nCash: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nBonus: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  nDepositCount: 1,
                  nDepositDiscount: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                    },
                  },
                  { upsert: true },
                ),
                depositNotificationPublish({
                  iUserId,
                  ePaymentStatus: paymentStatusEnum.SUCCESS,
                  sPushType: pushTypeEnums.TRANSACTION,
                }),
              ]);
              // await queuePush('pushNotification:Deposit', { iUserId, ePaymentStatus: 'S', sPushType: 'Transaction' })

              return await this.distributeReferralBonus(referralPayload);
            }
          }

          const [updateDepositResult, oldBalance] = await Promise.all([
            this.userDepositDao.update(
              {
                ePaymentStatus: paymentStatusEnum.SUCCESS,
                sInfo: Flatted.stringify(payload),
                iTransactionId: referenceId,
                iOrderId: payload.deposit.iOrderId,
                dProcessedDate: new Date(),
              },
              { where: { id: deposit.id }, transaction: t, lock: true },
            ),
            this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true }),
          ]);

          const {
            nCurrentBonus: nOldBonus,
            nCurrentTotalBalance: nOldTotalBalance,
            nCurrentDepositBalance: nOldDepositBalance,
            nCurrentWinningBalance: nOldWinningBalance,
          } = oldBalance;
          console.log('test 3')


          await Promise.all([
            this.userBalanceDao.update(
              {
                nCurrentDepositBalance: literal(`nCurrentDepositBalance + ${oGST.nAmountAfterGST}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${oGST.nAmountAfterGST}`),
                nTotalDepositAmount: literal(`nTotalDepositAmount + ${oGST.nAmountAfterGST}`),
                nTotalBonusEarned: literal(`nTotalBonusEarned + ${oGST.nGSTAmount}`),
                nCurrentBonus: literal(`nCurrentBonus + ${oGST.nGSTAmount}`),
                nTotalDepositCount: literal("nTotalDepositCount + 1"),
              },
              {
                where: { iUserId },
                transaction: t,
                lock: true,
              },
            ),
            this.passbookDao.create(
              {
                iUserId,
                nAmount : oGST.nAmountAfterGST,
                nCash : oGST.nAmountAfterGST,
                nBonus : oGST.nGSTAmount,
                eUserType,
                dBonusExpiryDate,
                nOldBonus,
                nOldTotalBalance,
                nOldDepositBalance,
                nOldWinningBalance,
                eTransactionType: TransactionTypeEnums.DEPOSIT,
                iUserDepositId: deposit.id,
                eType: PassbookTypeEnums.CREDITED,
                sRemarks: "Amount has been deposited successfully",
                dActivityDate: new Date(),
                iTransactionId: referenceId,
                sPromocode: deposit.sPromocode,
                eStatus: PassbookStatusTypeEnums.COMPLETED,
              },
              { transaction: t, lock: true },
            ),
            console.log('GST updated passbook'),

            this.passbookDao.create({ iUserId, nAmount: oGST.nGSTAmount, eUserType,dBonusExpiryDate, nOldBonus, nOldTotalBalance, nOldDepositBalance, nOldWinningBalance,iUserDepositId: deposit.id, eTransactionType: TransactionTypeEnums.GST, eType: PassbookTypeEnums.DEBITED, sRemarks: `You have paid ${oGST.nGSTAmount} ₹ as GST on the deposit of ${oGST.nRequestedAmount} ₹`, dActivityDate: new Date(), eStatus: PassbookStatusTypeEnums.COMPLETED }, { transaction: t, lock: true }),
            this.statisticsDao.updateOne(
              { iUserId: new ObjectId(iUserId) },
              {
                $inc: {
              nActualBonus: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  nActualDepositBalance: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nDeposits: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nCash: parseFloat(oGST.nAmountAfterGST.toString()).toFixed(2),
                  nBonus: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                  nDepositCount: 1,
                  nDepositDiscount: parseFloat(oGST.nGSTAmount.toString()).toFixed(2),
                },
              },
              { upsert: true },
            ),
          ]);
          // await queuePush('pushNotification:Deposit', { iUserId, ePaymentStatus: paymentStatusEnum.SUCCESS, sPushType: 'Transaction' })
          await depositNotificationPublish({
            iUserId,
            ePaymentStatus: paymentStatusEnum.SUCCESS,
            sPushType: pushTypeEnums.TRANSACTION,
          });
          const referralPayload = { iUserId, t, updateDepositResult };
          return await this.distributeReferralBonus(referralPayload);
        }
      }
    } catch (error) {
      throw error;
    }
  };

  private distributeReferralBonus = async (
    payload: DistributeReferralBonusPayload,
  ): Promise<{
    alreadySuccess: boolean;
    status: StatusCodeEnums;
    message: string;
    ePaymentStatus: paymentStatusEnum;
  }> => {
    try {
      // Assign referral on first deposit
      const { iUserId, t, updateDepositResult } = payload;
      const user = await this.userDao.findById(iUserId);
      const { sReferrerRewardsOn = "", iReferredBy = "" } = user;
      // TODO-ISSUE use proper enums and DAO related code
      if (iReferredBy && sReferrerRewardsOn && sReferrerRewardsOn === "FIRST_DEPOSIT") {
        let depositCount = await this.userDepositDao.findAndCountAll({
          where: {
            iUserId,
            ePaymentStatus: paymentStatusEnum.SUCCESS,
          },
          transaction: t,
          lock: true,
        });

        depositCount += updateDepositResult[0];

        // TODO-ISSUE what if depositCount is not equal to 1
        if (depositCount === 1) {
          const referrerId = iReferredBy.toString();
          const referredBy = await this.userDao.findById(referrerId);
          if (referredBy) {
            const registerReferBonus = await this.commonRuleDao.findRule(CommonRuleEnums.REGISTER_REFER);
            if (registerReferBonus) {
              const refer = await this.referBonusTransaction({
                referById: referredBy._id,
                rule: registerReferBonus,
                referCode: referredBy.sReferCode,
                userName: referredBy.sUsername,
                type: referredBy.eType,
                referrals: 1,
                referralId: iUserId,
              });

              if (refer.isSuccess === false) {
                return {
                  alreadySuccess: false,
                  status: StatusCodeEnums.BAD_REQUEST,
                  message: messagesEnglish.went_wrong_with.replace("##", messagesEnglish.bonus),
                  ePaymentStatus: paymentStatusEnum.SUCCESS,
                };
              }
              // Todo : Add Push Notification through microservice
              //await queuePush('pushNotification:registerReferBonus', { _id: referredBy._id })
            }
          }
        }
      }
      return {
        alreadySuccess: false,
        status: StatusCodeEnums.OK,
        message: messagesEnglish.not_exist.replace("##", messagesEnglish.bonus),
        ePaymentStatus: paymentStatusEnum.SUCCESS,
      };
    } catch (error) {
      throw error;
    }
  };

  public referBonusTransaction = async ({ referralId, referById, referCode, userName, type, referrals, rule }) => {
    try {
      let userId: string = referralId.toString();
      let { eType, nAmount, eRule, nExpireDays } = rule;
      nAmount = parseFloat(nAmount.toString());
      const dBonusExpiryDate = new Date();
      dBonusExpiryDate.setDate(dBonusExpiryDate.getDate() + nExpireDays);
      // TODO-ISSUE use proper enums
      const eTransactionType =
        eRule === CommonRuleEnums.REGISTER_BONUS ? TransactionTypeEnums.BONUS : TransactionTypeEnums.REFER_BONUS;

      if (eRule === CommonRuleEnums.REGISTER_REFER && referById) {
        // const passbookProcessed = await checkProcessed(
        //   `referBonus:${userId}:${referById}`,
        //   20
        // ) //TODO: This is a redis task which is till now not properly implemented.
        // if (passbookProcessed === 'EXIST') return { isSuccess: true }  //TODO: this is also related to above redis task
      }
      // TODO-ISSUE DAO's code
      return sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (transaction) => {
          let remarks;

          const userBalance = await this.userBalanceDao.findUserBalance(userId, transaction, true);
          const {
            nCurrentWinningBalance = 0,
            nCurrentDepositBalance,
            nCurrentTotalBalance,
            nCurrentBonus,
          } = userBalance;

          // TODO-ISSUE use enums
          if (eType === CashbackTypeEnums.CASH) {
            const updateQueryData: UpdateUserBalance = {
              nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${nAmount}`),
              nCurrentDepositBalance: literal(`nCurrentDepositBalance + ${nAmount}`),
            };
            await this.userBalanceDao.updateUserBalance(updateQueryData, userId, transaction);
          } else if (eType === CashbackTypeEnums.BONUS) {
            const updateQueryData: UpdateUserBalance = {
              nCurrentBonus: literal(`nCurrentBonus + ${nAmount}`),
              nTotalBonusEarned: literal(`nTotalBonusEarned + ${nAmount}`),
            };
            await this.userBalanceDao.updateUserBalance(updateQueryData, userId, transaction);
          }

          // TODO-ISSUE use enums
          if (eRule === CommonRuleEnums.REFER_CODE_BONUS) {
            remarks = `${userName} get refer code bonus`;
          } else if (eRule === CommonRuleEnums.REGISTER_REFER) {
            remarks = `${userName} get register refer bonus`;
          } else {
            remarks = `${userName} get register bonus`;
          }

          // TODO-ISSUE DAO's code
          await this.passbookDao.createJoinUserLeagueRecord(
            {
              iUserId: userId,
              nAmount: nAmount,
              nCash: eType === CashbackTypeEnums.CASH ? nAmount : 0,
              nBonus: eType === CashbackTypeEnums.BONUS ? nAmount : 0,
              eTransactionType,
              eType: PassbookTypeEnums.CREDITED,
              eUserType: type,
              nOldWinningBalance: nCurrentWinningBalance,
              nOldDepositBalance: nCurrentDepositBalance,
              nOldTotalBalance: nCurrentTotalBalance,
              nOldBonus: nCurrentBonus,
              dBonusExpiryDate,
              sRemarks: remarks,
              sCommonRule: eRule,
              dActivityDate: new Date(),
            },
            { transaction: transaction, lock: true },
          );
          const nCash = eType === CashbackTypeEnums.CASH ? nAmount : 0;
          // const nCount = eType === 'C' ? 1 : 0
          const nBonus = eType === CashbackTypeEnums.BONUS ? nAmount : 0;
          const isExist = await this.statisticsDao.countDocument(userId);

          if (!isExist) {
            await this.statisticsDao.createDocument(userId);
          }

          await this.statisticsDao.updateStats({ iUserId: userId, nBonus, nCash, nReferrals: referrals });

          return { isSuccess: true };
        },
      );
    } catch (error) {
      throw error;
    }
  };

  public requestTransfer = async (data: any) => {
    try {
      const { iUserId, nFinalAmount, iWithdrawId, iAdminId, iPassbookId, id, isVerify, Token } = data;
      //   const { isVerify, Token } = await this.validateCashfreeToken();
      const tranferData = JSON.stringify({
        beneId: iUserId,
        amount: nFinalAmount,
        transferId: id || iWithdrawId,
      });
      if (isVerify) {
        const response = await axios.post(
          `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_TRANSFER_PATH}`,
          tranferData,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${Token}` } },
        );

        console.log('cashfree request transfer :', response.data)
        const logData = {
          iUserId,
          iAdminId,
          iWithdrawId,
          iPassbookId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
          oReq: { nFinalAmount, transferId: id || iWithdrawId },
        };
        publishTransaction(logData);
        // apiLogServices.saveTransactionLog(logData) TODO: implement this when log microservice is ready

        const { success, status, message, sCurrentStatus } = await this.handleCashfreeError(response.data);
        if (!success) {
          if ((status === "409" || status === "400") && message === "Transfer Id already exists") {
            const iNewWithdrawId = data.id || iWithdrawId;
            const id = `${process.env.CASHFREE_ORDERID_PREFIX}${iNewWithdrawId}`;
            const reqTransData = { iUserId, nFinalAmount, iWithdrawId, iAdminId, iPassbookId, id: Number(id), isVerify, Token};
            const newData = await this.requestTransfer(reqTransData);
            console.log('newdata :', newData)
            return newData;
          } else {
            const err = {
              success,
              status,
              message,
              sCurrentStatus,
              referenceId: response.data && response.data.data ? response.data.data.referenceId : null,
            };
            console.log('payout request transfer', err)
            return err;
          }
        } else {
          console.log('request transfer success')
          return { success: true, referenceId: response.data.data.referenceId };
        }
      }
    } catch (error) {
      console.error('cashfree payout request transfer', error)
      return { success: false, ...error };
    }
  };

  public handleCashfreeError = (data: any) => {
    const { subCode, message, status } = data;
    if (Number(subCode) === StatusCodeEnums.OK) {
      return { success: true };
    }
    return { success: false, status: subCode, message, sCurrentStatus: status };
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

  public userPlayDeduction = async (
    queryData: UserPlayDeductionQueryData,
    session: any,
  ): Promise<{ isSuccess: boolean; nPrice: number; nActualBonus?: number }> => {
    //TODO: need to fix this return type from any to custom type.
    return await sequelizeConnection.sequelize.transaction(
      {
        isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
      },
      async (transaction: Transaction): Promise<{ isSuccess: boolean; nPrice: number; nActualBonus?: number }> => {
        //TODO: Need to add a interface in return type.
        let {
          userId,
          userLeagueId,
          matchLeagueId,
          matchId,
          nPrice,
          nBonusUtil = 0,
          sMatchName,
          sUserName,
          eType,
          eCategory,
          bPrivateLeague,
          joinPrice: nJoinPrice,
          promoDiscount: nPromoDiscount = 0,
          promoCode: sPromocode,
        } = queryData;

        nBonusUtil = Number(nBonusUtil);
        let iUserLeagueId = userLeagueId.toString(),
          iMatchId = matchId.toString(),
          iMatchLeagueId = matchLeagueId.toString(),
          updateUserStatsQuery: queryDataStatsService;

        const leagueJoinAmount = Number(nPrice);
        const userBalance = await this.userBalanceDao.findUserBalance(userId, transaction, true);
        if (!userBalance) {
          return { isSuccess: false, nPrice };
        }

        const { nCurrentWinningBalance, nCurrentDepositBalance, nCurrentTotalBalance, nCurrentBonus } = userBalance;
        let nActualBonus = 0;

        if (nBonusUtil && nBonusUtil > 0 && nPrice > 0) {
          const nBonus = (nPrice * nBonusUtil) / 100;

          if (userBalance.nCurrentBonus - nBonus >= 0) {
            nActualBonus = nBonus;
            if (userBalance.nCurrentTotalBalance < nPrice - nBonus) {
              return {
                isSuccess: false,
                nPrice: nPrice - nBonus - userBalance.nCurrentTotalBalance,
                nActualBonus: nActualBonus,
              };
            }
          } else {
            nActualBonus = userBalance.nCurrentBonus;
            if (userBalance.nCurrentTotalBalance < nPrice - userBalance.nCurrentBonus) {
              return {
                isSuccess: false,
                nPrice: nPrice - userBalance.nCurrentBonus - userBalance.nCurrentTotalBalance,
                nActualBonus: nActualBonus,
              };
            }
          }
        } else if (userBalance.nCurrentTotalBalance < nPrice) {
          return {
            isSuccess: false,
            nPrice: nPrice - userBalance.nCurrentTotalBalance,
            nActualBonus: nActualBonus,
          };
        }
        nPrice = nActualBonus ? nPrice - nActualBonus : nPrice;
        let nCash = 0,
          nWin = 0,
          bResetDeposit = false;
        // if user having deposit balance less than contest price to join, then we'll check for winning balance.
        if (userBalance.nCurrentDepositBalance < nPrice) {
          if (userBalance.nCurrentDepositBalance < 0) {
            // we'll cut contest join price from winning balance.
            nWin = nPrice;
            const updateQueryData: UpdateUserBalance = {
              nCurrentWinningBalance: literal(`nCurrentWinningBalance - ${nPrice}`),
              nCurrentTotalBalance: literal(`nCurrentTotalBalance - ${nPrice}`),
              nCurrentBonus: literal(`nCurrentBonus - ${nActualBonus}`),
            };

            await this.userBalanceDao.updateUserBalance(updateQueryData, userId, transaction);
            await this.userBalanceDao.updateUserBalanceAfterContestJoin(
              userId,
              transaction,
              true,
              nPrice,
              nActualBonus,
            );
          } else {
            bResetDeposit = true;
            nWin = nPrice - userBalance.nCurrentDepositBalance;

            const updateQueryData: UpdateUserBalance = {
              nCurrentDepositBalance: 0,
              nCurrentWinningBalance: literal(
                `nCurrentWinningBalance - ${nPrice - userBalance.nCurrentDepositBalance}`,
              ),
              nCurrentTotalBalance: literal(`nCurrentTotalBalance - ${nPrice}`),
              nCurrentBonus: literal(`nCurrentBonus - ${nActualBonus}`),
            };
            await this.userBalanceDao.updateUserBalance(updateQueryData, userId, transaction);
          }
        } else {
          nCash = nPrice;

          const updateQueryData: UpdateUserBalance = {
            nCurrentDepositBalance: literal(`nCurrentDepositBalance - ${nPrice}`),
            nCurrentTotalBalance: literal(`nCurrentTotalBalance - ${nPrice}`),
            nCurrentBonus: literal(`nCurrentBonus - ${nActualBonus}`),
          };
          await this.userBalanceDao.updateUserBalance(updateQueryData, userId, transaction);
        }
        const sRemarks = sPromocode
          ? `${sUserName} participated in ${sMatchName} with Promocode ${sPromocode}`
          : `${sUserName} participated in ${sMatchName}`;
        const passbook = await this.passbookDao.createJoinUserLeagueRecord(
          {
            iUserId: userId,
            nAmount: leagueJoinAmount,
            nCash: nPrice,
            nBonus: nActualBonus,
            iUserLeagueId,
            iMatchLeagueId,
            iMatchId,
            dActivityDate: new Date(),
            eUserType: eType,
            eTransactionType: TransactionTypeEnums.PLAY,
            eType: PassbookTypeEnums.DEBITED,
            nOldWinningBalance: nCurrentWinningBalance,
            nOldDepositBalance: nCurrentDepositBalance,
            nOldTotalBalance: nCurrentTotalBalance,
            nOldBonus: nCurrentBonus,
            sRemarks,
            sPromocode,
            eCategory,
          },
          { transaction: transaction, lock: true },
        );
        if (!passbook || (passbook && !passbook.id))
          return {
            isSuccess: false,
            nPrice: nPrice,
            nActualBonus: nActualBonus,
          };
        const matchCategory = this.getStatisticsSportsKey(eCategory);
        let leagueTypeStat;
        if (bPrivateLeague) {
          leagueTypeStat = {
            [`${matchCategory}.nJoinPLeague`]: 1,
            [`${matchCategory}.nJoinPLeagueSpend`]: Number(parseFloat(leagueJoinAmount.toString()).toFixed(2)),
            nTotalPLeagueSpend: Number(parseFloat(leagueJoinAmount.toString()).toFixed(2)),
          };
        } else {
          leagueTypeStat = {
            [`${matchCategory}.nJoinLeague`]: 1,
            nTotalSpend: Number(parseFloat(nJoinPrice.toString()).toFixed(2)),
            nDiscountAmount: Number(parseFloat(nPromoDiscount.toString()).toFixed(2)),
          };
        }
        let query = {};
        if (!bResetDeposit) {
          leagueTypeStat = {
            ...leagueTypeStat,
            nActualDepositBalance: -Number(parseFloat(nCash.toString()).toFixed(2)),
          };
        } else {
          query = { $set: { nActualDepositBalance: 0 } };
        }
        updateUserStatsQuery = {
          userId,
          matchCategory,
          leagueJoinAmount,
          nPrice,
          nActualBonus,
          matchId: iMatchId,
          nCash,
          nWin,
          nPromoDiscount,
          leagueTypeStat, //TODO: need to change this after testing.
          query,
        };
        await this.statisticsDao.updateUserBalanceStats(updateUserStatsQuery, session);
        return { isSuccess: true, nPrice: nPrice, nActualBonus: nActualBonus };
      },
    );
  };

  public deductTDSEndofYear = async (oTDS: deductTDSInterface): Promise<void> => {
    try {
      const {
        iUserId,
        nCurrentWinningBalance,
        nCurrentDepositBalance,
        nCurrentTotalBalance,
        nCurrentBonus,
        nTDSAmount,
        nPercentage,
        nTaxableAmount,
        FINANCIAL_YEAR_END_DATE,
      } = oTDS;

      await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          await Promise.all([
            this.userBalanceDao.update(
              {
                nCurrentTotalBalance: literal(`nCurrentTotalBalance - ${nTDSAmount}`),
                nCurrentWinningBalance: literal(`nCurrentWinningBalance - ${nTDSAmount}`),
              },
              { where: { iUserId: iUserId }, transaction: t, lock: true },
            ),
          ]);
          // Deduct TDS from UserBalance
          // Create Passbook Entry For TDS
          const passbook = await this.passbookDao.create(
            {
              iUserId,
              eTransactionType: TransactionTypeEnums.TDS,
              eUserType: UserTypeEnums.USER,
              eType: PassbookTypeEnums.DEBITED,
              nAmount: nTDSAmount,
              nCash: nTDSAmount,
              nOldWinningBalance: nCurrentWinningBalance,
              nOldDepositBalance: nCurrentDepositBalance,
              nOldTotalBalance: nCurrentTotalBalance,
              nOldBonus: nCurrentBonus,
              sRemarks: `You have paid ${nTDSAmount} ₹ as TDS on the withdrawal of ${nCurrentWinningBalance} ₹`,
              dActivityDate: new Date(),
            },
            { transaction: t, lock: true },
          );

          // Create  UserTDS Entry
          await this.tdsDao.create(
            {
              iUserId,
              nPercentage,
              nOriginalAmount: nCurrentWinningBalance,
              nAmount: nTDSAmount,
              nActualAmount: convertToDecimal(nCurrentWinningBalance - nTDSAmount),
              nTaxableAmount,
              iPassbookId: passbook.id,
              eUserType: UserTypeEnums.USER,
              eStatus: UserStatusEnums.ACTIVE,
              bIsEOFY: true,
              dCreatedAt: FINANCIAL_YEAR_END_DATE,
              dUpdatedAt: FINANCIAL_YEAR_END_DATE,
            },
            { transaction: t, lock: true },
          );
        },
      );

      // Update the User Statistics
      await this.statisticsDao.updateOne(
        { iUserId: new ObjectId(iUserId) },
        {
          $inc: {
            nActualWinningBalance: -Number(parseFloat(`${nTDSAmount}`).toFixed(2)),
            nTDSAmount: Number(parseFloat(`${nTDSAmount}`).toFixed(2)),
            nTDSCount: 1,
          },
        },
        { upsert: true },
      );
    } catch (error) {
      throw error;
    }
  };
  public createUserDeposit = async (payload: depositPayloadInterface): Promise<UserDepositOutput> => {
    try {
      const { nAmount, sPromocode, user, ePaymentGateway } = payload;
      let nCash,
        nBonus = 0;

      return await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction): Promise<UserDepositOutput> => {
          // TODO-ISSUE remove any use proper type
          let userDeposit: UserDepositOutput,
            paymentStatus = paymentStatusEnum.PENDING;
          if (user.bIsInternalAccount === true) {
            paymentStatus = paymentStatusEnum.SUCCESS;
          }

          const iOrderId = randomIdgenerator(10);
          const iTransactionId = uuid();
          if (sPromocode) {
            userDeposit = await this.promocodeHandling({
              nAmount: Number(nAmount),
              sPromocode,
              iUserId: user._id.toString(),
              t,
              iOrderId,
              iTransactionId,
              ePaymentGateway,
              paymentStatus,
              eType: user.eType,
            });
          } else {
            nCash = nAmount;
            const nDeposit = parseFloat(`${nCash}`) + parseFloat(`${nBonus}`);

            // TODO-ISSUE move all create function to DAO because it has transaction key which
            userDeposit = await this.userDepositDao.create(
              {
                iUserId: user._id.toString(),
                nAmount: nDeposit,
                nCash,
                iOrderId,
                iTransactionId,
                ePaymentGateway,
                ePaymentStatus: paymentStatusEnum.PENDING,
                nBonus,
                sInfo: `Deposit of ₹${nAmount}`,
                eUserType: user.eType,
              },
              { transaction: t, lock: true },
            );
            // userDeposit = userDeposit;
          }
          console.log(userDeposit);
          return userDeposit;
        },
      );
    } catch (error) {
      throw error;
    }
  };

  public processAdminDeposit = async (payload: processAdminDepositPayload): Promise<boolean> => {
    try {
      const { ePaymentStatus, iAdminId, id, sIP } = payload;
      let logData;
      try {
        return await sequelizeConnection.sequelize.transaction(
          {
            isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
          },
          async (t: Transaction) => {
            const bProcessing = await redisClient.incr(`processDeposit:${id}`);
            if (bProcessing > 1) return false;

            const deposit = await this.userDepositDao.findOne({ where: { id }, transaction: t, lock: true });
            if (deposit.ePaymentStatus !== paymentStatusEnum.PENDING) {
              await redisClient.del(`processDeposit:${id}`);
              return false;
            } else {
              await redisClient.expire(`processDeposit:${id}`, 20);
              const {
                iUserId,
                nCash,
                nBonus = 0,
                ePaymentStatus: ePaymentOldStatus,
                sInfo,
                sPromocode,
                iPromocodeId,
                nAmount,
                ePlatform,
              } = deposit;
              const oOldFields = {
                nCash,
                nBonus,
                ePaymentStatus: ePaymentOldStatus,
                sInfo,
                sPromocode,
                iPromocodeId,
                nAmount,
                ePlatform,
              };
              const oldBalance = await this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true });
              let nOldBonus = 0;
              let nOldTotalBalance = 0;
              let nOldDepositBalance = 0;
              let nOldWinningBalance = 0;
              if (oldBalance) {
                const { nCurrentBonus, nCurrentTotalBalance, nCurrentDepositBalance, nCurrentWinningBalance } =
                  oldBalance;
                nOldBonus = nCurrentBonus;
                nOldTotalBalance = nCurrentTotalBalance;
                nOldDepositBalance = nCurrentDepositBalance;
                nOldWinningBalance = nCurrentWinningBalance;
              } else {
                await this.userBalanceDao.create(
                  { iUserId, eUserType: deposit.eUserType },
                  { transaction: t, lock: true },
                );
              }

              const dProcessedDate = new Date();

              if (ePaymentStatus === paymentStatusEnum.SUCCESS) {
                let dBonusExpiryDate;
                if (deposit.iPromocodeId) {
                  const promocode = await this.promocodeDao.findOne(
                    { _id: deposit.iPromocodeId.toString() },
                    { nBonusExpireDays: 1 },
                  );

                  const { nBonusExpireDays = 0 } = promocode;
                  dBonusExpiryDate = new Date();
                  dBonusExpiryDate.setDate(dBonusExpiryDate.getDate() + nBonusExpireDays);
                  dBonusExpiryDate.setUTCHours(23, 59); // 23:59 EOD
                } else {
                  dBonusExpiryDate = null;
                }
                await this.userDepositDao.update(
                  { ePaymentStatus: paymentStatusEnum.SUCCESS, iTransactionId: deposit.id, dProcessedDate },
                  { where: { id }, transaction: t, lock: true },
                );

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

                await this.passbookDao.create(
                  {
                    iUserId,
                    nAmount,
                    nCash,
                    nBonus,
                    eUserType: deposit.eUserType,
                    dBonusExpiryDate,
                    nOldBonus,
                    nOldTotalBalance,
                    nOldDepositBalance,
                    nOldWinningBalance,
                    eTransactionType: TransactionTypeEnums.DEPOSIT,
                    iUserDepositId: deposit.id,
                    eType: PassbookTypeEnums.CREDITED,
                    sRemarks: "Deposit Approved.",
                    dProcessedDate,
                    sPromocode,
                    eStatus: PassbookStatusTypeEnums.COMPLETED,
                  },
                  { transaction: t, lock: true },
                );
                await this.statisticsDao.updateOne(
                  { iUserId: new ObjectId(iUserId) },
                  {
                    $inc: {
                      nActualDepositBalance: Number(parseFloat(`${nCash}`).toFixed(2)),
                      nDeposits: Number(parseFloat(`${nCash}`).toFixed(2)),
                      nCash: Number(parseFloat(nCash.toFixed(2))),
                      nBonus: Number(parseFloat(`${nBonus}`).toFixed(2)),
                      nActualBonus: Number(parseFloat(`${nBonus}`).toFixed(2)),
                      nDepositCount: 1,
                      nDepositDiscount: Number(parseFloat(`${nBonus}`).toFixed(2)),
                    },
                  },
                  { upsert: true },
                );

                if (deposit.iPromocodeId) {
                  const [iUserId, iPromocodeId] = [new ObjectId(deposit.iUserId), new ObjectId(deposit.iPromocodeId)];
                  await this.promocodeStatsDao.create({
                    iUserId,
                    iPromocodeId,
                    nAmount: nBonus,
                    sTransactionType: PromoCodeTypesEnums.DEPOSIT,
                    idepositId: Number(deposit.id),
                  });
                }
              } else if (ePaymentStatus === paymentStatusEnum.CANCELLED) {
                await this.userDepositDao.update(
                  { ePaymentStatus: paymentStatusEnum.REFUNDED, dProcessedDate },
                  { where: { id }, transaction: t, lock: true },
                );
              }
              const oNewFields = { ...oOldFields, ePaymentStatus };
              logData = {
                oOldFields,
                oNewFields,
                sIP,
                iAdminId: new ObjectId(iAdminId),
                iUserId: new ObjectId(iUserId),
                eKey: logTypeEnums.DEPOSIT,
              };
              publishAdminLogs(logData);
              return true;
            }
          },
        );
      } catch (error) {
        throw error;
      }
    } catch (error) {
      throw error;
    }
  };

  private promocodeHandling = async (payload: promocodeHandling): Promise<UserDepositOutput> => {
    const { nAmount, sPromocode, iUserId, t, iOrderId, paymentStatus, eType, ePaymentGateway } = payload;
    let nCash,
      nBonus = 0,
      promocodeId,
      promocodes;
    const promocode = await this.promocodeDao.getPromocode(promoCodeStats.Y, sPromocode);

    if (!promocode) throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.invalid_promo_err);
    if (
      nAmount &&
      !(promocode.nMaxAmount >= convertToDecimal(nAmount, 2) && promocode.nMinAmount <= convertToDecimal(nAmount, 2))
    )
      throw new HttpException(
        StatusCodeEnums.NOT_ACCEPTABLE,
        messagesEnglish.promocode_unavailable
          .replace("₹min_amount", `₹${promocode.nMinAmount}`)
          .replace("₹max_amount", `₹${promocode.nMaxAmount}`),
      );

    promocodes = promocode;
    const { dExpireTime, nAmount: promoAmount, bIsPercent } = promocode;
    if (dExpireTime && new Date(dExpireTime) < new Date(Date.now())) {
      throw new HttpException(StatusCodeEnums.NOT_ACCEPTABLE, messagesEnglish.promocode_expired);
    }
    promocodeId = promocode._id.toString();
    if (bIsPercent) {
      const tmp = ((parseFloat(`${promoAmount}`) * parseFloat(`${nAmount}`)) / 100).toFixed(2);
      nBonus = Number(parseFloat(tmp));
      nCash = parseFloat(`${nAmount}`);
    } else {
      nBonus = parseFloat(`${promoAmount}`);
      nCash = parseFloat(`${nAmount}`);
    }
    const nDeposit = parseFloat(`${nCash}`) + parseFloat(`${nBonus}`);

    const { count: allCount } = await this.userDepositDao.findAndCountAll({
      where: {
        iPromocodeId: promocodeId,
        ePaymentStatus: { [Op.in]: [paymentStatusEnum.PENDING, paymentStatusEnum.SUCCESS] },
      },
      transaction: t,
      lock: true,
    });
    const { count } = await this.userDepositDao.findAndCountAll({
      where: {
        iUserId,
        iPromocodeId: promocodeId,
        ePaymentStatus: { [Op.in]: [paymentStatusEnum.PENDING, paymentStatusEnum.SUCCESS] },
      },
      transaction: t,
      lock: true,
    });
    if (!promocodes.bMaxAllowForAllUser && count >= promocodes.nMaxAllow) {
      throw new HttpException(StatusCodeEnums.NOT_FOUND, "Promocode max usage limit reached!");
    } else if (allCount >= promocodes.nMaxAllow || count >= promocodes.nPerUserUsage) {
      throw new HttpException(StatusCodeEnums.NOT_FOUND, "Promocode max usage limit reached!");
    }
    // TODO-ISSUE why are you storing data in userDeposit again
    const userDeposit: UserDepositOutput = await this.userDepositDao.create(
      {
        iUserId,
        nAmount: nDeposit,
        nCash,
        nBonus,
        sInfo: `Deposit of ₹${nAmount}`,
        ePaymentGateway,
        iPromocodeId: promocodeId,
        iOrderId,
        ePaymentStatus: paymentStatus,
        sPromocode: sPromocode.toUpperCase(),
        eUserType: eType,
      },
      { transaction: t, lock: true },
    );
    return userDeposit;
  };

  public createAdminDeposit = async (payload: CreateAdminDepositPayload): Promise<boolean> => {
    try {
      let { iUserId, nCash, nBonus, eType, sPassword, sIP, bonusExpireDays } = payload;
      let logData;
      const { _id: iAdminId } = payload;

      nBonus = Number(nBonus) || 0;
      nCash = Number(nCash) || 0;
      const nAmount = nBonus + nCash;

      const pass = await this.credentialDao.findOneAndCache({ eKey: "PAY" });
      if (!bcrypt.compareSync(sPassword, pass.sPassword)) {
        throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.auth_failed);
      }

      let dBonusExpiryDate = null;
      if (nBonus > 0) {
        dBonusExpiryDate = new Date();
        dBonusExpiryDate.setDate(dBonusExpiryDate.getDate() + bonusExpireDays.nMax);
        dBonusExpiryDate.setUTCHours(23, 59); // 23:59 EOD
      }

      const userData = await this.userDao.findById(iUserId, { eType: 1, sUsername: 1 });

      let statUpdate = {};
      const { eType: eUserType, sUsername } = userData;
      await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          const userDeposit = await this.userDepositDao.create(
            {
              iUserId,
              nAmount,
              nCash,
              nBonus,
              ePaymentStatus: paymentStatusEnum.SUCCESS,
              sInfo: "Deposit by admin",
              eUserType,
              dProcessedDate: new Date(),
            },
            { transaction: t, lock: true },
          );
          const oldBalance = await this.userBalanceDao.findOne({
            where: { iUserId },
            transaction: t,
            lock: true,
            raw: true,
          });
          const {
            nCurrentBonus: nOldBonus,
            nCurrentTotalBalance: nOldTotalBalance,
            nCurrentDepositBalance: nOldDepositBalance,
            nCurrentWinningBalance: nOldWinningBalance,
          } = oldBalance;

          if (eType === depositTypeEnums.DEPOSIT) {
            await this.userBalanceDao.update(
              {
                nCurrentDepositBalance: literal(`nCurrentDepositBalance + ${nCash}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${nCash}`),
                nCurrentBonus: literal(`nCurrentBonus + ${nBonus}`),
                nTotalBonusEarned: literal(`nTotalBonusEarned + ${nBonus}`),
                nTotalDepositAmount: literal(`nTotalDepositAmount + ${nCash}`),
                nTotalDepositCount: literal("nTotalDepositCount + 1"),
              },
              {
                where: { iUserId },
                transaction: t,
                lock: true,
              },
            );
            statUpdate = {
              $inc: {
                nActualDepositBalance: Number(parseFloat(nCash).toFixed(2)),
                nActualBonus: Number(parseFloat(nBonus).toFixed(2)),
                nDeposits: Number(parseFloat(nCash).toFixed(2)),
                nCash: Number(parseFloat(nCash).toFixed(2)),
                nBonus: Number(parseFloat(nBonus).toFixed(2)),
                nDepositCount: 1,
              },
            };
          } else if (eType === depositTypeEnums.WINNING) {
            await this.userBalanceDao.update(
              {
                nCurrentWinningBalance: literal(`nCurrentWinningBalance + ${nCash}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${nCash}`),
                nTotalWinningAmount: literal(`nTotalWinningAmount + ${nCash}`),
                nTotalDepositCount: literal("nTotalDepositCount + 1"),
              },
              {
                where: { iUserId },
                transaction: t,
                lock: true,
              },
            );
            statUpdate = {
              $inc: {
                nActualWinningBalance: Number(parseFloat(nCash).toFixed(2)),
                nWinnings: Number(parseFloat(nCash).toFixed(2)),
                nTotalWinnings: Number(parseFloat(nCash).toFixed(2)),
                nDepositCount: 1,
              },
            };
          }
          await this.passbookDao.createPassbookEntry(
            {
              iUserId,
              nAmount,
              nCash,
              nBonus,
              nOldBonus,
              nOldTotalBalance,
              nOldDepositBalance,
              nOldWinningBalance,
              eTransactionType: TransactionTypeEnums.DEPOSIT,
              eUserType,
              iUserDepositId: userDeposit.id,
              eType: PassbookTypeEnums.CREDITED,
              sRemarks: "Deposit by admin",
              dBonusExpiryDate,
              dActivityDate: new Date(),
              eStatus: PassbookStatusTypeEnums.COMPLETED,
            },
            t,
          );
        },
      );

      await this.statisticsDao.updateOne({ iUserId: new ObjectId(iUserId) }, statUpdate, { upsert: true });

      logData = {
        oOldFields: {},
        oNewFields: {
          eType: nBonus ? "BONUS" : eType === depositTypeEnums.DEPOSIT ? "DEPOSIT" : "WINNING",
          nCash,
          nBonus,
          iUserId,
          sUsername,
        },
        sIP,
        iAdminId: new ObjectId(iAdminId),
        iUserId: new ObjectId(iUserId),
        eKey: logTypeEnums.ADMIN_DEPOSIT,
      };
      if (logData) await publishAdminLogs(logData);
      return true;
    } catch (error) {
      throw error;
    }
  };

  public createWithdraw = async (withdrawPayload: processWithdrawInterface): Promise<defaultResponseInterface> => {
    try {
      const { nAmount: amount, user, ePaymentGateway, nWithdrawFee, winBifurcate } = withdrawPayload;
      return await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          const existWithdraw = await this.userWithdrawDao.findAndCountAll({
            where: {
              iUserId: user._id.toString(),
              ePaymentStatus: payoutStatusEnums.PENDING,
            },
            attributes: [
              "id",
              "iUserId",
              "ePaymentGateway",
              "ePaymentStatus",
              "sInfo",
              "nAmount",
              "nParentId",
              "dWithdrawalTime",
              "iWithdrawalDoneBy",
              "nWithdrawFee",
              "ePlatform",
              "dProcessedDate",
              "dCreatedAt",
            ],
            transaction: t,
            lock: true,
          });
          if (existWithdraw.count) {
            return {
              status: StatusCodeEnums.BAD_REQUEST,
              message: messagesEnglish.pending_withdrawal_exists,
              data: { bPending: true, existWithdraw },
            };
          } else {
            const oldWithdraw = await this.userWithdrawDao.findOne({
              where: { iUserId: user._id.toString() },
              order: [["id", "DESC"]],
              transaction: t,
              lock: true,
            });
            const nParentId = oldWithdraw ? oldWithdraw.id : null;
            const oldBalance = await this.userBalanceDao.findOne({
              where: { iUserId: user._id.toString() },
              transaction: t,
              lock: true,
            });
            const {
              nCurrentBonus: nOldBonus,
              nCurrentTotalBalance: nOldTotalBalance,
              nCurrentDepositBalance: nOldDepositBalance,
              nCurrentWinningBalance: nOldWinningBalance,
            } = oldBalance;

            const updateObj: any = {
              nCurrentTotalBalance: literal(`nCurrentTotalBalance - ${amount}`),
              nTotalWithdrawAmount: literal(`nTotalWithdrawAmount + ${amount}`),
              nTotalWithdrawCount: literal("nTotalWithdrawCount + 1"),
            };

            let updateStatsObj, resetFieldObj;
            if (!winBifurcate) {
              if (Math.floor(Number(amount)) > nOldWinningBalance) {
                return {
                  status: StatusCodeEnums.BAD_REQUEST,
                  message: messagesEnglish.insuff_balance.replace("##", messagesEnglish.withdraw),
                };
              }
              updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance - ${amount}`);
              updateStatsObj = {
                nActualWinningBalance: -Number(parseFloat(`${amount}`).toFixed(2)),
                nWinnings: -Number(parseFloat(`${amount}`).toFixed(2)),
              };
            } else if (nOldWinningBalance < Math.floor(Number(amount))) {
              if (nOldWinningBalance < 0) {
                if (Math.floor(Number(amount)) > nOldDepositBalance) {
                  return {
                    status: StatusCodeEnums.BAD_REQUEST,
                    message: messagesEnglish.insuff_balance.replace("##", messagesEnglish.withdraw),
                  };
                }
                updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance - ${amount}`);
                updateStatsObj = {
                  nActualDepositBalance: -Number(parseFloat(`${amount}`).toFixed(2)),
                  nCash: -Number(parseFloat(`${amount}`).toFixed(2)),
                };
              } else {
                if (nOldDepositBalance - (Number(amount) - nOldWinningBalance) < 0) {
                  return {
                    status: StatusCodeEnums.BAD_REQUEST,
                    message: messagesEnglish.insuff_balance.replace("##", messagesEnglish.withdraw),
                  };
                }

                updateObj.nCurrentDepositBalance = literal(
                  `nCurrentDepositBalance - ${Number(amount) - nOldWinningBalance}`,
                );
                updateObj.nCurrentWinningBalance = 0;
                updateStatsObj = {
                  nActualDepositBalance: -Number(parseFloat(`${amount} - ${nOldWinningBalance}`).toFixed(2)),
                  nCash: -Number(parseFloat(`${amount} - ${nOldWinningBalance}`).toFixed(2)),
                };
                resetFieldObj = { nActualWinningBalance: 0, nWinnings: 0 };
              }
            } else {
              updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance - ${amount}`);
              updateStatsObj = {
                nActualWinningBalance: -Number(parseFloat(`${amount}`).toFixed(2)),
                nWinnings: -Number(parseFloat(`${amount}`).toFixed(2)),
              };
            }
            updateStatsObj = {
              ...updateStatsObj,
              nWithdraw: Number(parseFloat(`${amount}`).toFixed(2)),
              nWithdrawCount: 1,
            };

            const userWithdraw = await this.userWithdrawDao.create(
              {
                iUserId: user._id.toString(),
                eUserType: user.eType,
                nAmount: amount,
                dWithdrawalTime: new Date(),
                nParentId,
                ePaymentGateway,
                nWithdrawFee,
              },
              { transaction: t, lock: true },
            );

            await Promise.all([
              this.userBalanceDao.update(updateObj, {
                where: { iUserId: user._id.toString() },
                transaction: t,
                lock: true,
              }),
              this.passbookDao.create(
                {
                  iUserId: user._id.toString(),
                  eUserType: user.eType,
                  amount,
                  nCash: amount,
                  nOldBonus,
                  nOldTotalBalance,
                  nOldDepositBalance,
                  nOldWinningBalance,
                  eTransactionType: TransactionTypeEnums.WITHDRAW,
                  iWithdrawId: userWithdraw.nParentId + 1,
                  eType: PassbookTypeEnums.DEBITED,
                  eStatus: PassbookStatusTypeEnums.COMPLETED,
                  sRemarks: "Withdrawal successfully",
                  nWithdrawFee,
                },
                { transaction: t, lock: true },
              ),
              this.statisticsDao.updateOne(
                { iUserId: new ObjectId(user._id.toString()) },
                { $inc: updateStatsObj, ...resetFieldObj },
                { upsert: true },
              ),
            ]);
            return { status: StatusCodeEnums.OK, message: messagesEnglish.withdraw_request_success };
          }
        },
      );
    } catch (error) {
      throw error;
    }
  };

  public adminWithdrawCreate = async (payload: adminWithdrawInterface): Promise<defaultResponseInterface> => {
    try {
      let { iUserId, iAdminId, nAmount, eType, sIP, nBonus = 0 } = payload;
      const iWithdrawalDoneBy = iAdminId;
      const userData = await this.userDao.findById(iUserId, {
        eType: 1,
        sUsername: 1,
      });
      if (!userData) {
        return {
          status: StatusCodeEnums.UNAUTHORIZED,
          message: messagesEnglish.err_unauthorized,
        };
      }
      const { eType: eUserType, sUsername } = userData;
      let logData;
      return await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          const [oldWithdraw, oldBalance] = await Promise.all([
            this.userWithdrawDao.findOne({
              where: { iUserId },
              order: [["id", "DESC"]],
              transaction: t,
              lock: true,
            }),
            this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true, raw: true }),
          ]);
          const nParentId = oldWithdraw ? oldWithdraw.id : null;
          const userWithdraw = await this.userWithdrawDao.create(
            {
              iUserId,
              eUserType,
              nAmount,
              sIP,
              ePaymentGateway: paymentGatewayEnums.ADMIN,
              ePaymentStatus: paymentStatusEnum.SUCCESS,
              dWithdrawalTime: new Date(),
              dProcessedDate: new Date(),
              iWithdrawalDoneBy,
              nParentId,
            },
            { transaction: t, lock: true },
          );
          const {
            nCurrentBonus: nOldBonus,
            nCurrentTotalBalance: nOldTotalBalance,
            nCurrentDepositBalance: nOldDepositBalance,
            nCurrentWinningBalance: nOldWinningBalance,
          } = oldBalance;

          let nCash = 0;
          let nWin = 0;
          if (eType === depositTypeEnums.WITHDRAW) {
            nCash = nAmount;
            await this.userBalanceDao.update(
              {
                nCurrentDepositBalance: literal(`nCurrentDepositBalance - ${nAmount}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance - ${nAmount}`),
                nTotalWithdrawAmount: literal(`nTotalWithdrawAmount + ${nAmount}`),
                nTotalWithdrawCount: literal("nTotalWithdrawCount + 1"),
              },
              {
                where: { iUserId },
                transaction: t,
                lock: true,
              },
            );
          } else if (eType === depositTypeEnums.WINNING) {
            nWin = nAmount;
            await this.userBalanceDao.update(
              {
                nCurrentWinningBalance: literal(`nCurrentWinningBalance - ${nAmount}`),
                nCurrentTotalBalance: literal(`nCurrentTotalBalance - ${nAmount}`),
                nTotalWithdrawAmount: literal(`nTotalWithdrawAmount + ${nAmount}`),
                nTotalWithdrawCount: literal("nTotalWithdrawCount + 1"),
              },
              {
                where: { iUserId },
                transaction: t,
                lock: true,
              },
            );
          }
          logData = {
            oOldFields: {},
            oNewFields: {
              eType: nBonus ? "BONUS" : "WINNING",
              nCash: nAmount,
              nBonus,
              iUserId,
              sUsername,
            },
            sIP,
            iAdminId: new ObjectId(iAdminId),
            iUserId: new ObjectId(iUserId),
            eKey: logTypeEnums.ADMIN_WITHDRAW,
          };
          await Promise.all([
            this.passbookDao.create(
              {
                iUserId,
                eUserType,
                nAmount,
                nCash: nAmount,
                nBonus,
                nOldBonus,
                nOldTotalBalance,
                nOldDepositBalance,
                nOldWinningBalance,
                eTransactionType: TransactionTypeEnums.WITHDRAW,
                iWithdrawId: userWithdraw.id,
                eType: PassbookTypeEnums.DEBITED,
                sRemarks: "Withdraw by admin",
                dActivityDate: new Date(),
                eStatus: PassbookStatusTypeEnums.COMPLETED,
              },
              { transaction: t, lock: true },
            ),
            this.statisticsDao.updateOne(
              { iUserId: new ObjectId(iUserId) },
              {
                $inc: {
                  nActualWinningBalance: -Number(parseFloat(`${nWin}`).toFixed(2)),
                  nActualDepositBalance: -Number(parseFloat(`${nCash}`).toFixed(2)),
                  nWinnings: -Number(parseFloat(`${nWin}`).toFixed(2)),
                  nTotalWinReturn: Number(parseFloat(`${nCash}`).toFixed(2)),
                  nWithdraw: Number(parseFloat(nAmount).toFixed(2)),
                  nWithdrawCount: 1,
                },
              },
              { upsert: true },
            ),
            publishAdminLogs(logData),
          ]);
          if (logData) await publishAdminLogs(logData);
          return {
            status: StatusCodeEnums.OK,
            message: messagesEnglish.successfully.replace("##", messagesEnglish.withdraw),
          };
        },
      );
    } catch (error) {
      throw error;
    }
  };

  public calculateTDS = async (oData: {
    iUserId: string;
    nFinalAmount: number;
    iWithdrawId?: IntegerDataType;
    iAdminId?: string;
    iPassbookId?: number;
    oldBalance?: UserBalanceOutput;
  }): Promise<CalculateTDSResponse> => {
    try {
      const { iUserId, nFinalAmount: nWithdrawAmount } = oData;
      // Find out the TDS percentage
      let nPercentage = 0;
      let nOpeningBalanceOfYear: any = {};
      const tdsSetting = await this.settingsDao.findOneAndLean({ sKey: sKeyEnums.TDS }, { nMax: 1 });
      if (tdsSetting) nPercentage = tdsSetting.nMax;

      // Get the Financial Year Start and End Dates
      let FINANCIAL_YEAR_START_DATE = `${new Date().getFullYear()}-04-01`;
      let FINANCIAL_YEAR_END_DATE = `${new Date().getFullYear() + 1}-03-31`;
      FINANCIAL_YEAR_START_DATE = moment(new Date(FINANCIAL_YEAR_START_DATE)).startOf("day").toISOString();
      FINANCIAL_YEAR_END_DATE = moment(new Date(FINANCIAL_YEAR_END_DATE)).endOf("day").toISOString();

      // Find out Taxable amount and TDS breakup
      /*
    New Formula of TDS : A-Total Withdraw amount, B-Total Deposit Amount, C-Opening Balance of Year, D: Already Deducted TDS on Amount
    nTaxableAmount = A - B - C - D
  */
      const oCommonQuery = {
        iUserId,
        dUpdatedAt: { [Op.gte]: new Date(FINANCIAL_YEAR_START_DATE), [Op.lte]: new Date(FINANCIAL_YEAR_END_DATE) },
      };
      // Find out total withdraw, deposit, tds deducted amount and opening balance of year
      const [nTotalWithdrawnAmount, nTotalDepositedAmount, nTotalProcessedAmount] = await Promise.all([
        this.userWithdrawDao.sum("nAmount", {
          where: { ...oCommonQuery, ePaymentStatus: paymentStatusEnum.SUCCESS },
          raw: true,
        }),
        this.passbookDao.sum("nCash", {
          where: { ...oCommonQuery, eStatus: PassbookStatusTypeEnums.COMPLETED, eTransactionType: "Deposit" },
          raw: true,
        }),
        this.tdsDao.sum("nOriginalAmount", {
          where: { ...oCommonQuery, eStatus: UserStatusEnums.ACTIVE },
          raw: true,
        }),
      ]);
      nOpeningBalanceOfYear = await this.passbookDao.findOne({
        where: { iUserId, dUpdatedAt: { [Op.lt]: FINANCIAL_YEAR_START_DATE } },
        attributes: ["nNewWinningBalance"],
        order: [["id", "desc"]],
        limit: 1,
        raw: true,
      });
      if (!nOpeningBalanceOfYear) nOpeningBalanceOfYear = { nNewWinningBalance: 0 };

      const nActualWithdrawalAmount = Number(nTotalWithdrawnAmount + nWithdrawAmount);
      const nTaxableAmount = convertToDecimal(
        nActualWithdrawalAmount -
          nTotalDepositedAmount -
          nOpeningBalanceOfYear?.nNewWinningBalance -
          nTotalProcessedAmount,
      ); // GOVT. TDS Formula

      const nTDSAmount = convertToDecimal(nTaxableAmount * Number(nPercentage / 100)); // Calculate TDS as per TDS percentage
      const nAmountAfterTax = convertToDecimal(nWithdrawAmount - nTDSAmount);
      const nTaxFreeAmount = convertToDecimal(
        Number(nTotalDepositedAmount + nOpeningBalanceOfYear?.nNewWinningBalance + nTotalProcessedAmount) -
          Number(nTotalWithdrawnAmount),
      );

      const oTDSBreakUp = {
        nAmountAfterTax,
        nTotalWithdrawalAmount: nActualWithdrawalAmount || 0,
        nTotalDepositedAmount: nTotalDepositedAmount || 0,
        nOpeningBalanceOfYear: nOpeningBalanceOfYear.nNewWinningBalance || 0,
        nTotalProcessedAmount: nTotalProcessedAmount || 0,
        nTaxableAmount: nTaxableAmount > 0 ? nTaxableAmount : 0,
        nRequestedAmount: nWithdrawAmount,
        nTDSAmount: nTDSAmount > 0 ? nTDSAmount : 0,
        nPercentage,
        nTaxFreeAmount: nTaxFreeAmount || 0,
        dFinancialYear: `${new Date().getFullYear()}-${(new Date().getFullYear() % 100) + 1}`,
        bEligible: false,
      };

      if (nTaxableAmount <= 0) return { isSuccess: false, oTDS: oTDSBreakUp, oData };
      return { isSuccess: true, oTDS: oTDSBreakUp, oData };
    } catch (error) {
      throw error;
    }
  };
  public createTDSEntry = async (oData: { iUserId: string; nFinalAmount: number }, t: Transaction): Promise<void> => {
    try {
      // Fetch User Balance
      const oldBalance = await this.userBalanceDao.findOne({
        where: { iUserId: oData.iUserId.toString() },
        transaction: t,
        lock: true,
      });
      const {
        nCurrentBonus: nOldBonus,
        nCurrentTotalBalance: nOldTotalBalance,
        nCurrentDepositBalance: nOldDepositBalance,
        nCurrentWinningBalance: nOldWinningBalance,
      } = oldBalance;

      // Calculate And Get TDS breakup
      const { oTDS } = await this.calculateTDS(oData);
      const { nTDSAmount, nTaxableAmount, nPercentage, nRequestedAmount } = oTDS;

      // Make TDS Entry In Passbook
      const passbook = await this.passbookDao.create(
        {
          iUserId: oData.iUserId.toString(),
          eTransactionType: TransactionTypeEnums.TDS,
          eUserType: UserTypeEnums.USER,
          eType: PassbookTypeEnums.DEBITED,
          nAmount: nTDSAmount,
          nCash: nTDSAmount,
          nOldWinningBalance,
          nOldDepositBalance,
          nOldTotalBalance,
          nOldBonus,
          sRemarks: `You have paid ${nTDSAmount} ₹ as TDS on the withdrawal of ${nRequestedAmount} ₹`,
          dActivityDate: new Date(),
        },
        { transaction: t, lock: true },
      );

      // Make TDS Entry In Passbook
      await this.tdsDao.create(
        {
          iUserId: oData.iUserId.toString(),
          nPercentage,
          nOriginalAmount: nTaxableAmount,
          nAmount: nTDSAmount,
          nActualAmount: convertToDecimal(nTaxableAmount - nTDSAmount),
          nWithdrawAmount: nTaxableAmount,
          iPassbookId: passbook.id,
          eUserType: UserTypeEnums.USER,
          eStatus: UserStatusEnums.ACTIVE,
        },
        { transaction: t, lock: true },
      );
    } catch (error) {
      console.error("TDS create error: ", error);
      throw error;
    }
  };

  public processAdminWithdraw = async (payload: payoutProcessInterface): Promise<defaultResponseInterface> => {
    try {
      const { ePaymentStatus, reject_reason = "", iAdminId, iWithdrawId, ip, isVerify, Token } = payload;

      return await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          const bProcessing = await redisClient.incr(`processWithdraw:${iWithdrawId}`);
          if (bProcessing > 1) {
            return {
              status: StatusCodeEnums.BAD_REQUEST,
              message: messagesEnglish.wait_for_proccessing.replace("##", messagesEnglish.withdraw),
            };
          }

          const withdraw: userWithdrawOutput = await this.userWithdrawDao.findOne({
            where: {
              id: iWithdrawId,
              ePaymentStatus: {
                [Op.in]: [
                  payoutStatusEnums.PENDING,
                  payoutStatusEnums.SUCCESS,
                  payoutStatusEnums.INITIATED,
                  payoutStatusEnums.ON_HOLD,
                ],
              },
            },
            transaction: t,
            lock: true,
          });
          console.log("admin process withdraw : ", withdraw);
          if (!withdraw) {
            await redisClient.del(`processWithdraw:${iWithdrawId}`);
            throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.withdraw_process_err);
          } else {
            await redisClient.expire(`processWithdraw:${iWithdrawId}`, 20);
            const {
              iUserId,
              eUserType,
              nAmount,
              ePaymentStatus: ePaymentOldStatus,
              sInfo,
              ePlatform,
              sIP,
              bReversed,
            } = withdraw;

            const oOldFields = {
              nAmount,
              ePaymentStatus: ePaymentOldStatus,
              sInfo,
              ePlatform,
              sIP,
            };
            await this.userWithdrawDao.update(
              {
                iWithdrawalDoneBy: iAdminId.toString(),
              },
              {
                where: { id: iWithdrawId },
                transaction: t,
                lock: true,
              },
            );
            const oldBalance = await this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true });
            const {
              nCurrentBonus: nOldBonus,
              nCurrentTotalBalance: nOldTotalBalance,
              nCurrentDepositBalance: nOldDepositBalance,
              nCurrentWinningBalance: nOldWinningBalance,
            } = oldBalance;

            const dProcessedDate = new Date();

            if (ePaymentStatus === payoutStatusEnums.SUCCESS) {
              if (ePaymentOldStatus === payoutStatusEnums.PENDING || ePaymentOldStatus === payoutStatusEnums.ON_HOLD) {
                // ************** Add money to user account Remaining **************
                const { iUserId, nAmount, id: iWithdrawId, nWithdrawFee = 0 } = withdraw;

                const passbook = await this.passbookDao.findOne({
                  where: { iUserId, iWithdrawId: iWithdrawId },
                  attributes: ["id"],
                  transaction: t,
                  lock: true,
                });

                const nFinalAmount = Number(nAmount - nWithdrawFee);
                const oWithdrawalData = {
                  iUserId,
                  nFinalAmount,
                  iWithdrawId,
                  iAdminId,
                  iPassbookId: passbook.id,
                  oldBalance,
                };
                // here, we need to calculate tds before process
                const { isSuccess, oTDS, oData } = await this.getAndProcessTDS(oWithdrawalData);
                
                console.log("TDS:::", oTDS);
                if (!isSuccess) {
                  return {
                    status: StatusCodeEnums.BAD_REQUEST,
                    message: messagesEnglish.withdraw_process_err,
                  };
                }
                let { success, message, sCurrentStatus, referenceId } = await this.requestTransfer({iUserId: oData.iUserId,nFinalAmount: oData.nFinalAmount,iWithdrawId: Number(oData.iWithdrawId), iPassbookId: oData.iPassbookId, id: Number(oData.iWithdrawId),iAdminId: oData.iAdminId,isVerify,Token});
                if (!referenceId) referenceId = null;
                if (success) {
                  await Promise.all([
                    this.userWithdrawDao.update(
                      {
                        ePaymentStatus: payoutStatusEnums.SUCCESS,
                        iWithdrawalDoneBy: iAdminId.toString(),
                        dProcessedDate,
                        iTransactionId: referenceId,
                      },
                      {
                        where: { id: iWithdrawId },
                        transaction: t,
                        lock: true,
                      },
                    ),
                    this.passbookDao.update(
                      { dProcessedDate },
                      {
                        where: { iWithdrawId: iWithdrawId },
                        transaction: t,
                        lock: true,
                      },
                    ),
                  ]);

                  // Create TDS Entry
                  const { nTDSAmount, nTaxableAmount, nPercentage, nRequestedAmount } = oTDS;
                  const passbook = await this.passbookDao.create(
                    {
                      iUserId,
                      eTransactionType: TransactionTypeEnums.TDS,
                      eUserType: UserTypeEnums.USER,
                      eType: PassbookTypeEnums.DEBITED,
                      nAmount: nTDSAmount,
                      nCash: nTDSAmount,
                      nOldWinningBalance,
                      nOldDepositBalance,
                      nOldTotalBalance,
                      nOldBonus,
                      sRemarks: `You have paid ${nTDSAmount} ₹ as TDS on the withdrawal of ${nRequestedAmount} ₹`,
                      dActivityDate: new Date(),
                    },
                    { transaction: t, lock: true },
                  );

                  await Promise.all([
                    this.tdsDao.create(
                      {
                        iUserId,
                        nPercentage,
                        nOriginalAmount: nTaxableAmount,
                        nAmount: nTDSAmount,
                        nActualAmount: convertToDecimal(nTaxableAmount - nTDSAmount),
                        nTaxableAmount,
                        iPassbookId: passbook.id,
                        eUserType: UserTypeEnums.USER,
                        eStatus: tdsStatusEnums.ACCEPTED,
                      },
                      { transaction: t, lock: true },
                    ),
                    withdrawNotificationPublish({
                      iUserId,
                      ePaymentStatus: payoutStatusEnums.SUCCESS,
                      sPushType: pushTypeEnums.TRANSACTION,
                    }),
                  ]);

                  // await queuePush("pushNotification:Withdraw", {
                  //   iUserId,
                  //   ePaymentStatus: payoutStatusEnums.SUCCESS,
                  //   sPushType: pushTypeEnums.TRANSACTION,
                  // });
                } else if ([payoutStatusEnums.PENDING, payoutStatusEnums.SUCCESS].includes(sCurrentStatus)) {
                  await Promise.all([
                    this.userWithdrawDao.update(
                      {
                        ePaymentStatus: payoutStatusEnums.INITIATED,
                        iWithdrawalDoneBy: iAdminId.toString(),
                        dProcessedDate,
                        iTransactionId: referenceId,
                      },
                      {
                        where: { id: iWithdrawId },
                        transaction: t,
                        lock: true,
                      },
                    ),
                    this.passbookDao.update(
                      { dProcessedDate },
                      {
                        where: { iWithdrawId: iWithdrawId },
                        transaction: t,
                        lock: true,
                      },
                    ),
                  ]);
                  return {
                    status: StatusCodeEnums.OK,
                    message: messagesEnglish.successfully.replace("##", messagesEnglish.processWithdraw),
                  };
                } else {
                  return {
                    status: StatusCodeEnums.BAD_REQUEST,
                    message: messagesEnglish.error_payout_process.replace("##", message),
                  };
                }
              }
              if (ePaymentOldStatus === payoutStatusEnums.INITIATED) {
                console.log("Initiated");
                // Fetch TDS BreakUp
                const oData = {
                  iUserId,
                  nFinalAmount: Number(nAmount),
                };

                await Promise.all([
                  this.userWithdrawDao.update(
                    {
                      ePaymentStatus: payoutStatusEnums.SUCCESS,
                      iWithdrawalDoneBy: iAdminId.toString(),
                      dProcessedDate,
                    },
                    { where: { id: iWithdrawId }, transaction: t, lock: true },
                  ),
                  this.passbookDao.update(
                    { dProcessedDate },
                    {
                      where: { iWithdrawId: iWithdrawId },
                      transaction: t,
                      lock: true,
                    },
                  ),
                  this.createTDSEntry(oData, t),
                  console.log("withdraw success operation"),
                ]);
              }
              // await queuePush("pushNotification:Withdraw", {
              //   iUserId,
              //   ePaymentStatus: payoutStatusEnums.SUCCESS,
              //   sPushType: pushTypeEnums.TRANSACTION,
              // });
              await withdrawNotificationPublish({
                iUserId,
                ePaymentStatus: payoutStatusEnums.SUCCESS,
                sPushType: pushTypeEnums.TRANSACTION,
              });
            } else if (ePaymentStatus === payoutStatusEnums.CANCELLED) {
              // If withdraw request for rejection but reject_reason is not set
              if (!reject_reason) {
                return {
                  status: StatusCodeEnums.BAD_REQUEST,
                  message: messagesEnglish.reject_reason_required,
                };
              }
              // If reject_reason is uncategorized
              if (!Object.values(REJECT_REASON_ENUMS).includes(reject_reason)) {
                return {
                  status: StatusCodeEnums.BAD_REQUEST,
                  message: messagesEnglish.reject_reason_invalid,
                };
              }

              const passbook = await this.passbookDao.findOne({
                where: { iUserId, iWithdrawId: iWithdrawId },
                transaction: t,
                lock: true,
              });

              if (!passbook) {
                return {
                  status: StatusCodeEnums.NOT_FOUND,
                  message: messagesEnglish.not_exist.replace("##", messagesEnglish.passbook),
                };
              }

              if (ePaymentOldStatus === payoutStatusEnums.SUCCESS && bReversed === 1) {
                await this.userWithdrawDao.update(
                  {
                    ePaymentStatus: payoutStatusEnums.REFUNDED,
                    sInfo: reject_reason || "",
                    iWithdrawalDoneBy: iAdminId.toString(),
                    dProcessedDate,
                  },
                  { where: { id: iWithdrawId }, transaction: t, lock: true },
                );
              } else if (ePaymentOldStatus === payoutStatusEnums.SUCCESS && bReversed === 0) {
                return {
                  status: StatusCodeEnums.BAD_REQUEST,
                  message: messagesEnglish.reject_status_invalid,
                };
              }
              await Promise.all([
                this.userWithdrawDao.update(
                  {
                    ePaymentStatus: payoutStatusEnums.REFUNDED,
                    sInfo: reject_reason || "",
                    iWithdrawalDoneBy: iAdminId.toString(),
                    dProcessedDate,
                  },
                  { where: { id: iWithdrawId }, transaction: t, lock: true },
                ),
                withdrawNotificationPublish({
                  iUserId,
                  ePaymentStatus: payoutStatusEnums.SUCCESS,
                  sPushType: pushTypeEnums.TRANSACTION,
                }),
              ]);

              // await queuePush("pushNotification:Withdraw", {
              //   iUserId,
              //   ePaymentStatus: payoutStatusEnums.REFUNDED,
              //   sPushType: pushTypeEnums.TRANSACTION,
              // });

              let updateStatsObj;
              const updateObj: any = {
                nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${nAmount}`),
                nTotalWithdrawAmount: literal(`nTotalWithdrawAmount - ${nAmount}`),
                nTotalWithdrawCount: literal("nTotalWithdrawCount - 1"),
              };

              const winDiff = passbook.nOldWinningBalance - passbook.nNewWinningBalance;
              const depositDiff = passbook.nOldDepositBalance - passbook.nNewDepositBalance;
              if (depositDiff > 0) {
                if (winDiff > 0) {
                  updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance + ${winDiff}`);
                  updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance + ${depositDiff}`);
                  updateStatsObj = {
                    nActualDepositBalance: Number(parseFloat(`${depositDiff}`).toFixed(2)),
                    nCash: Number(parseFloat(`${depositDiff}`).toFixed(2)),
                    nActualWinningBalance: Number(parseFloat(`${winDiff}`).toFixed(2)),
                    nWinnings: Number(parseFloat(`${winDiff}`).toFixed(2)),
                  };
                } else {
                  updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance + ${nAmount}`);
                  updateStatsObj = {
                    nActualDepositBalance: Number(parseFloat(`${nAmount}`).toFixed(2)),
                    nCash: Number(parseFloat(`${nAmount}`).toFixed(2)),
                  };
                }
              } else {
                updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance + ${nAmount}`);
                updateStatsObj = {
                  nActualWinningBalance: Number(parseFloat(nAmount.toString()).toFixed(2)),
                  nWinnings: Number(parseFloat(nAmount.toString()).toFixed(2)),
                };
              }
              updateStatsObj = {
                ...updateStatsObj,
                nWithdraw: -Number(parseFloat(`${nAmount}`).toFixed(2)),
                nWithdrawCount: -1,
              };
              const user = await this.userDao.findOneAndLean({ _id: iUserId });

              await Promise.all([
                this.userBalanceDao.update(updateObj, {
                  where: { iUserId },
                  transaction: t,
                  lock: true,
                }),
                this.passbookDao.create(
                  {
                    iUserId,
                    eUserType,
                    nAmount,
                    nCash: nAmount,
                    nOldBonus,
                    nOldTotalBalance,
                    nOldDepositBalance,
                    nOldWinningBalance,
                    eTransactionType: TransactionTypeEnums.WITHDRAW_RETURN,
                    iWithdrawId: withdraw.id,
                    eType: PassbookTypeEnums.CREDITED,
                    sRemarks: `${reject_reason}`,
                    dProcessedDate,
                    eStatus: payoutStatusEnums.REFUNDED,
                  },
                  { transaction: t, lock: true },
                ),
                this.statisticsDao.updateOne(
                  { iUserId: new ObjectId(iUserId) },
                  { $inc: updateStatsObj },
                  { upsert: true },
                ),
                queuePush("SendMail", {
                  sSlug: "withdraw-rejected-email",
                  replaceData: {
                    reject_reason: reject_reason || "unknown or uncategorized",
                  },
                  to: user.sEmail,
                }),
              ]);
            } else if (ePaymentStatus === payoutStatusEnums.ON_HOLD) {
              if (ePaymentOldStatus !== payoutStatusEnums.PENDING) {
                return {
                  status: StatusCodeEnums.BAD_REQUEST,
                  message: messagesEnglish.withdraw_on_hold,
                };
              }

              await this.userWithdrawDao.update(
                {
                  ePaymentStatus: payoutStatusEnums.ON_HOLD,
                  iWithdrawalDoneBy: iAdminId.toString(),
                  dProcessedDate,
                },
                { where: { id: iWithdrawId }, transaction: t, lock: true },
              );
            }
            const oNewFields = {
              ...oOldFields,
              ePaymentStatus,
              sIP: ip,
            };
            const logData = {
              oOldFields,
              oNewFields,
              sIP: ip,
              iAdminId: new ObjectId(iAdminId),
              iUserId: new ObjectId(iUserId),
              eKey: logTypeEnums.WITHDRAW,
            };

            await Promise.all([
              withdrawNotificationPublish({
                iUserId,
                ePaymentStatus: payoutStatusEnums.REFUNDED,
                sPushType: pushTypeEnums.TRANSACTION,
              }),
              publishAdminLogs(logData),
            ]);

            console.log("withdraw operation finished");
            return {
              status: StatusCodeEnums.OK,
              message: messagesEnglish.successfully.replace("##", messagesEnglish.processWithdraw),
            };
          }
        },
      );
    } catch (error) {
      throw error;
    }
  };

  public getAndProcessTDS = async (oWithdrawalData: {
    iUserId: string;
    nFinalAmount: number;
    iWithdrawId: IntegerDataType;
    iAdminId: string;
    iPassbookId: number;
    oldBalance: UserBalanceOutput;
  }) => {
    try {
      console.log("=========== TDS PROCESS STARTED ===========");

      // Find out taxable amount
      const oTransferData = {
        ...oWithdrawalData,
        oldBalance: {},
      };
      const { isSuccess, oTDS } = await this.calculateTDS(oWithdrawalData);
      if (!isSuccess) return { isSuccess: true, oTDS, oData: oTransferData };
      const { nAmountAfterTax } = oTDS;

      oTransferData.nFinalAmount = nAmountAfterTax;
      console.log("=========== TDS PROCESS COMPLETED ===========");
      return { isSuccess: true, oTDS, oData: oTransferData };
    } catch (error) {
      return { isSuccess: false };
    }
  };

  public cancelWithdraw = async (iWithdrawId: number): Promise<defaultResponseInterface> => {
    try {
      const cancelTransaction = await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction): Promise<defaultResponseInterface> => {
          const withdraw: userWithdrawOutput = await this.userWithdrawDao.findOne({
            where: { id: iWithdrawId },
            transaction: t,
            lock: true,
          });
          if (!withdraw) {
            throw new HttpException(
              StatusCodeEnums.BAD_REQUEST,
              messagesEnglish.not_exist.replace("##", messagesEnglish.withdraw),
            );
          }
          if (
            withdraw.ePaymentStatus !== payoutStatusEnums.PENDING &&
            withdraw.ePaymentStatus !== payoutStatusEnums.ON_HOLD
          ) {
            throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.withdraw_process_err);
          }
          const { nAmount, eUserType, iUserId } = withdraw;
          const oldBalance = await this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true });
          const {
            nCurrentBonus: nOldBonus,
            nCurrentTotalBalance: nOldTotalBalance,
            nCurrentDepositBalance: nOldDepositBalance,
            nCurrentWinningBalance: nOldWinningBalance,
          } = oldBalance;

          await this.userWithdrawDao.update(
            {
              ePaymentStatus: payoutStatusEnums.CANCELLED,
              sInfo: "Withdraw cancelled by self.",
              dProcessedDate: new Date(),
            },
            { where: { id: iWithdrawId }, transaction: t, lock: true },
          );

          let updateStatsObj;
          const updateObj: any = {
            nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${nAmount}`),
            nTotalWithdrawAmount: literal(`nTotalWithdrawAmount - ${nAmount}`),
            nTotalWithdrawCount: literal("nTotalWithdrawCount - 1"),
          };
          const passbook = await this.passbookDao.findOne({
            where: { iUserId, iWithdrawId },
            transaction: t,
            lock: true,
          });
          const winDiff = passbook.nOldWinningBalance - passbook.nNewWinningBalance;
          const depositDiff = passbook.nOldDepositBalance - passbook.nNewDepositBalance;
          if (depositDiff > 0) {
            if (winDiff > 0) {
              updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance + ${winDiff}`);
              updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance + ${depositDiff}`);
              updateStatsObj = {
                nActualDepositBalance: Number(parseFloat(`${depositDiff}`).toFixed(2)),
                nCash: Number(parseFloat(`${depositDiff}`).toFixed(2)),
                nActualWinningBalance: Number(parseFloat(`${winDiff}`).toFixed(2)),
                nWinnings: Number(parseFloat(`${winDiff}`).toFixed(2)),
              };
            } else {
              updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance + ${nAmount}`);
              updateStatsObj = {
                nActualDepositBalance: Number(parseFloat(`${nAmount}`).toFixed(2)),
                nCash: Number(parseFloat(`${nAmount}`).toFixed(2)),
              };
            }
          } else {
            updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance + ${nAmount}`);
            updateStatsObj = {
              nActualWinningBalance: Number(parseFloat(`${nAmount}`).toFixed(2)),
              nWinnings: Number(parseFloat(`${nAmount}`).toFixed(2)),
            };
          }
          updateStatsObj = {
            ...updateStatsObj,
            nWithdraw: -Number(parseFloat(`${nAmount}`).toFixed(2)),
            nWithdrawCount: -1,
          };

          await Promise.all([
            this.userBalanceDao.update(updateObj, {
              where: { iUserId },
              transaction: t,
              lock: true,
            }),
            this.passbookDao.create(
              {
                iUserId,
                eUserType,
                nAmount,
                nCash: nAmount,
                nOldBonus,
                nOldTotalBalance,
                nOldDepositBalance,
                nOldWinningBalance,
                eTransactionType: TransactionTypeEnums.WITHDRAW_RETURN,
                iWithdrawId: withdraw.id,
                eType: PassbookTypeEnums.CREDITED,
                sRemarks: "Withdraw cancelled by self.",
                eStatus: PassbookStatusTypeEnums.CANCEL,
                dActivityDate: new Date(),
              },
              { transaction: t, lock: true },
            ),
            this.statisticsDao.updateOne({ iUserId }, { $inc: updateStatsObj }, { upsert: true }),
          ]);

          return {
            status: StatusCodeEnums.OK,
            message: messagesEnglish.cancel_success.replace("##", messagesEnglish.withdraw),
          };
        },
      );
      return cancelTransaction;
    } catch (error) {
      throw error;
    }
  };

  public successTransaction = async (
    data: { referenceId: string },
    iWithdrawId: number,
  ): Promise<{ isSuccess: boolean }> => {
    try {
      const { referenceId } = data;
      const dProcessedDate = new Date();

      await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          const withdraw = await this.userWithdrawDao.findOne({
            where: {
              id: iWithdrawId,
              ePaymentStatus: { [Op.in]: [payoutStatusEnums.PENDING, payoutStatusEnums.INITIATED] },
            },
            raw: true,
            transaction: t,
            lock: true,
          });

          if (withdraw) {
            await Promise.all([
              this.userWithdrawDao.update(
                { ePaymentStatus: payoutStatusEnums.SUCCESS, dProcessedDate, iTransactionId: referenceId },
                { where: { id: iWithdrawId }, transaction: t, lock: true },
              ),
              this.passbookDao.update(
                { dProcessedDate },
                { where: { iWithdrawId: iWithdrawId.toString() }, transaction: t, lock: true },
              ),
            ]);

            // Fetch TDS BreakUp
            // const oData = {
            //   iUserId: withdraw.iUserId,
            //   nFinalAmount: withdraw.nAmount
            // }
            // const { oTDS } = await createTDSEntry(oData, t)
            if (withdraw.eUserType === UserTypeEnums.USER) {
              // const { nTaxableAmount, nTDSAmount, nPercentage } = oTDS
              await withdrawNotificationPublish({
                iUserId: withdraw.iUserId,
                ePaymentStatus: payoutStatusEnums.SUCCESS,
                sPushType: pushTypeEnums.TRANSACTION,
              });
              // await queuePush('pushNotification:TDS', { iUserId: withdraw.iUserId, ePaymentStatus: 'S', sPushType: 'Transaction', nTaxableAmount, nTDSAmount, nPercentage })
            }
          }
        },
      );
      return { isSuccess: true };
    } catch (error) {
      return { isSuccess: false };
    }
  };

  public reversedTransaction = async (iWithdrawId: number): Promise<{ isSuccess: boolean }> => {
    try {
      await this.userWithdrawDao.update({ dReversedDate: new Date(), bReversed: true }, { where: { id: iWithdrawId } });
      return { isSuccess: true };
    } catch (error) {
      return { isSuccess: false };
    }
  };

  public cancellOrRejectTransaction = async (
    data: any,
    ePaymentStatus: paymentStatusEnum,
    iWithdrawId: number,
  ): Promise<{ isSuccess: boolean }> => {
    try {
      await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction) => {
          const withdraw = await this.userWithdrawDao.findOne({
            where: {
              id: iWithdrawId,
              ePaymentStatus: { [Op.notIn]: [payoutStatusEnums.CANCELLED, payoutStatusEnums.REFUNDED] },
            },
            raw: true,
            transaction: t,
            lock: true,
          });

          if (withdraw) {
            const { iUserId, nAmount } = withdraw;
            const dProcessedDate = new Date();

            const oldBalance = await this.userBalanceDao.findOne({ where: { iUserId }, transaction: t, lock: true });
            const {
              eUserType,
              nCurrentBonus: nOldBonus,
              nCurrentTotalBalance: nOldTotalBalance,
              nCurrentDepositBalance: nOldDepositBalance,
              nCurrentWinningBalance: nOldWinningBalance,
            } = oldBalance;

            await this.userWithdrawDao.update(
              { ePaymentStatus, iTransactionId: data.referenceId, dProcessedDate },
              { where: { id: iWithdrawId }, transaction: t, lock: true },
            );

            let updateStatsObj;
            const updateObj: any = {
              nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${nAmount}`),
              nTotalWithdrawAmount: literal(`nTotalWithdrawAmount - ${nAmount}`),
              nTotalWithdrawCount: literal("nTotalWithdrawCount - 1"),
            };
            const passbook = await this.passbookDao.findOne({
              where: { iUserId, iWithdrawId: iWithdrawId },
              transaction: t,
              lock: true,
            });
            const winDiff = passbook.nOldWinningBalance - passbook.nNewWinningBalance;
            const depositDiff = passbook.nOldDepositBalance - passbook.nNewDepositBalance;
            if (depositDiff > 0) {
              if (winDiff > 0) {
                updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance + ${winDiff}`);
                updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance + ${depositDiff}`);
                updateStatsObj = {
                  nActualDepositBalance: Number(parseFloat(`${depositDiff}`).toFixed(2)),
                  nCash: Number(parseFloat(`${depositDiff}`).toFixed(2)),
                  nActualWinningBalance: Number(parseFloat(`${winDiff}`).toFixed(2)),
                  nWinnings: Number(parseFloat(`${winDiff}`).toFixed(2)),
                };
              } else {
                updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance + ${nAmount}`);
                updateStatsObj = {
                  nActualDepositBalance: Number(parseFloat(`${nAmount}`).toFixed(2)),
                  nCash: Number(parseFloat(`${nAmount}`).toFixed(2)),
                };
              }
            } else {
              updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance + ${nAmount}`);
              updateStatsObj = {
                nActualWinningBalance: Number(parseFloat(`${nAmount}`).toFixed(2)),
                nWinnings: Number(parseFloat(`${nAmount}`).toFixed(2)),
              };
            }
            updateStatsObj = {
              ...updateStatsObj,
              nWithdraw: -Number(parseFloat(`${nAmount}`).toFixed(2)),
              nWithdrawCount: -1,
            };

            await Promise.all([
              this.userBalanceDao.update(updateObj, {
                where: { iUserId },
                transaction: t,
                lock: true,
              }),
              this.passbookDao.create(
                {
                  iUserId,
                  eUserType,
                  nAmount,
                  nCash: nAmount,
                  nOldBonus,
                  nOldTotalBalance,
                  nOldDepositBalance,
                  nOldWinningBalance,
                  eTransactionType: TransactionTypeEnums.WITHDRAW_RETURN,
                  iWithdrawId: withdraw.id,
                  eType: PassbookTypeEnums.CREDITED,
                  sRemarks: "Withdrawal failed due to server error.",
                  dProcessedDate,
                  eStatus: paymentStatusEnum.REFUNDED,
                },
                { transaction: t, lock: true },
              ),
              this.statisticsDao.updateOne(
                { iUserId: new ObjectId(iUserId) },
                { $inc: updateStatsObj },
                { upsert: true },
              ),
            ]);

            if (eUserType === UserTypeEnums.USER)
              await queuePush("pushNotification:Withdraw", {
                iUserId,
                ePaymentStatus,
                sPushType: pushTypeEnums.TRANSACTION,
              });
          }
        },
      );
      return { isSuccess: true };
    } catch (error) {
      return { isSuccess: false };
    }
  };

  public processPayoutCashfreeCron = async (
    withdraw: userWithdrawOutput,
    payload: any,
  ): Promise<{ alreadySuccess: boolean; status: StatusCodeEnums }> => {
    try {
      const { iUserId, id, nAmount, eUserType } = withdraw;
      const { referenceId, beneId, status: ePaymentStatus, reason, transferMode } = payload.transfer;
      const sRemarks = `PaymentStatus: ${ePaymentStatus}, ReferenceId: ${referenceId}, BeneficiaryId: ${beneId}, Reason: ${reason}, TransferMode: ${transferMode}`;
      return await sequelizeConnection.sequelize.transaction(
        {
          isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
        },
        async (t: Transaction): Promise<{ alreadySuccess: boolean; status: StatusCodeEnums }> => {
          const oldBalance = await this.userBalanceDao.findOne({
            where: { iUserId },
            raw: true,
            transaction: t,
            lock: true,
          });
          const {
            nCurrentBonus: nOldBonus,
            nCurrentTotalBalance: nOldTotalBalance,
            nCurrentDepositBalance: nOldDepositBalance,
            nCurrentWinningBalance: nOldWinningBalance,
          } = oldBalance;

          if (ePaymentStatus === payoutStatusEnums.SUCCESS) {
            await this.userWithdrawDao.update(
              {
                ePaymentStatus: payoutStatusEnums.SUCCESS,
                iTransactionId: referenceId,
                sInfo: JSON.stringify(payload.transfer),
                dProcessedDate: new Date(),
              },
              { where: { id }, transaction: t, lock: true },
            );
            return { alreadySuccess: false, status: StatusCodeEnums.OK };
          } else if (
            [cashfreePayoutEnums.FAILED, cashfreePayoutEnums.ERROR, cashfreePayoutEnums.REJECTED].includes(
              ePaymentStatus,
            )
          ) {
            await this.userWithdrawDao.update(
              { ePaymentStatus: paymentStatusEnum.REFUNDED, dProcessedDate: new Date() },
              { where: { id }, transaction: t, lock: true },
            );

            let updateStatsObj;
            const updateObj: any = {
              nCurrentTotalBalance: literal(`nCurrentTotalBalance + ${nAmount}`),
              nTotalWithdrawAmount: literal(`nTotalWithdrawAmount - ${nAmount}`),
              nTotalWithdrawCount: literal("nTotalWithdrawCount - 1"),
            };
            const passbook = await this.passbookDao.findOne({
              where: { iUserId, iWithdrawId: id },
              transaction: t,
              lock: true,
            });
            const winDiff = (passbook.nOldWinningBalance - passbook.nNewWinningBalance) as number;
            const depositDiff = (passbook.nOldDepositBalance - passbook.nNewDepositBalance) as number;
            if (depositDiff > 0) {
              if (winDiff > 0) {
                updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance + ${winDiff}`);
                updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance + ${depositDiff}`);
                updateStatsObj = {
                  nActualDepositBalance: Number(parseFloat(`${depositDiff}`).toFixed(2)),
                  nCash: Number(parseFloat(`${depositDiff}`).toFixed(2)),
                  nActualWinningBalance: Number(parseFloat(`${winDiff}`).toFixed(2)),
                  nWinnings: Number(parseFloat(`${winDiff}`).toFixed(2)),
                };
              } else {
                updateObj.nCurrentDepositBalance = literal(`nCurrentDepositBalance + ${nAmount}`);
                updateStatsObj = {
                  nActualDepositBalance: Number(parseFloat(`${nAmount}`).toFixed(2)),
                  nCash: Number(parseFloat(`${nAmount}`).toFixed(2)),
                };
              }
            } else {
              updateObj.nCurrentWinningBalance = literal(`nCurrentWinningBalance + ${nAmount}`);
              updateStatsObj = {
                nActualWinningBalance: Number(parseFloat(`${nAmount}`).toFixed(2)),
                nWinnings: Number(parseFloat(`${nAmount}`).toFixed(2)),
              };
            }
            updateStatsObj = {
              ...updateStatsObj,
              nWithdraw: -Number(parseFloat(`${nAmount}`).toFixed(2)),
              nWithdrawCount: -1,
            };
            await Promise.all([
              this.userBalanceDao.update(updateObj, {
                where: { iUserId },
                transaction: t,
                lock: true,
              }),
              this.passbookDao.create(
                {
                  iUserId,
                  eUserType,
                  nAmount,
                  nCash: nAmount,
                  nOldBonus,
                  nOldTotalBalance,
                  nOldDepositBalance,
                  nOldWinningBalance,
                  eTransactionType: TransactionTypeEnums.WITHDRAW_RETURN,
                  iWithdrawId: withdraw.id,
                  eType: PassbookTypeEnums.CREDITED,
                  sRemarks,
                  eStatus: PassbookStatusTypeEnums.REFUND,
                },
                { transaction: t, lock: true },
              ),
              this.statisticsDao.updateOne(
                { iUserId: new ObjectId(iUserId) },
                { $inc: updateStatsObj },
                { upsert: true },
              ),
            ]);

            return { alreadySuccess: false, status: StatusCodeEnums.OK };
          } else if (ePaymentStatus === payoutStatusEnums.REVERSED) {
            await this.userWithdrawDao.update(
              { bReversed: true, dReversedDate: new Date() },
              { where: { id }, transaction: t, lock: true },
            );
            return { alreadySuccess: false, status: StatusCodeEnums.OK };
          } else {
            return { alreadySuccess: false, status: StatusCodeEnums.OK };
          }
        },
      );
    } catch (error) {
      throw error;
    }
  };
}
