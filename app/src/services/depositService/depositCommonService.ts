import { StatusCodeEnums, messagesEnglish, statusEnums } from "@/enums/commonEnum/commonEnum";
import { nodeENVEnums } from "@/enums/nodeEnvEnums/nodeEnvEnums";
import { sKeyEnums } from "@/enums/sKeyEnums/sKeyEnums";
import { settingsEnums } from "@/enums/settingsEnums/settingsEnums";
import { depositPayloadInterface } from "@/interfaces/depositPayload/depositPayloadInterface";
import { HttpException } from "@/library/HttpException/HttpException";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import UserDepositDao from "@/src/daos/UserDeposit/UserDepositDao";
import settingsDao from "@/src/daos/settingsDao/settingsDao";
import { ObjectId } from "mongoose";

export default class DepositCommonService {
  private settingsDao: settingsDao;
  private userDepositDao: UserDepositDao;
  private transactionDao: TransactionDao;

  constructor() {
    this.settingsDao = new settingsDao();
    this.userDepositDao = new UserDepositDao();
    this.transactionDao = new TransactionDao();
  }

  public validateDepositRateLimit = async (iUserId: ObjectId | string): Promise<{ status: string }> => {
    try {
      // TODO-ISSUE use enum for NODE_ENV
      if (process.env.NODE_ENV !== nodeENVEnums.PRODUCTION) {
        return { status: "success" };
      }
      const depositRateLimit = await this.settingsDao.findOneAndLean({
        sKey: settingsEnums.USER_DEPOSIT_RATE_LIMIT,
        eStatus: statusEnums.Y,
      });
      const depositRateLimitTimeFrame = await this.settingsDao.findOneAndLean({
        sKey: settingsEnums.USER_DEPOSIT_RATE_LIMIT_TIME_FRAME,
        eStatus: statusEnums.Y,
      });

      if (!depositRateLimit || !depositRateLimitTimeFrame) {
        return { status: "success" };
      }

      const currentDate = new Date().toISOString();
      const fromDate = new Date(
        new Date().setMinutes(new Date().getMinutes() - parseInt(`${depositRateLimitTimeFrame.nMax}`)),
      ).toISOString();

      // TODO-ISSUE move it to DAO
      const { count } = await this.userDepositDao.findAndCountByDate({
        iUserId: iUserId.toString(),
        currentDate,
        fromDate,
      });

      if (count >= parseInt(`${depositRateLimit.nMax}`)) {
        throw new HttpException(
          StatusCodeEnums.TOO_MANY_REQUEST,
          messagesEnglish.limit_reached.replace("##", messagesEnglish.depositRequest),
        );
      }
      return { status: "success" };
    } catch (error) {
      throw new HttpException(error.status, error.message);
    }
  };

  public createDeposit = async (payload: depositPayloadInterface): Promise<UserDepositOutput> => {
    try {
      const { nAmount } = payload;

      //const sErrorMessage = await this.kycValidation(iUserId);
      //if (sErrorMessage) throw new HttpException(StatusCodeEnums.BAD_REQUEST, sErrorMessage);

      // TODO use enum for sKey
      const depositValidation = await this.settingsDao.findOneAndLean({ sKey: sKeyEnums.DEPOSIT });
      if (!depositValidation) {
        throw new HttpException(StatusCodeEnums.NOT_FOUND, messagesEnglish.cvalidationSetting);
      }

      if (nAmount < parseInt(`${depositValidation.nMin}`)) {
        throw new HttpException(StatusCodeEnums.NOT_FOUND, `Deposit cannot be of less than ₹${depositValidation.nMin}`);
      }
      if (nAmount > parseInt(`${depositValidation.nMax}`)) {
        throw new HttpException(StatusCodeEnums.NOT_FOUND, `Deposit cannot be of more than ₹${depositValidation.nMax}`);
      }
      return await this.transactionDao.createUserDeposit(payload);
    } catch (err) {
      throw err;
    }
  };
}