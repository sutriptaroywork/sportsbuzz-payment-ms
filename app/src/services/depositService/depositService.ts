import { HttpException } from "@/library/HttpException/HttpException";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import SettingsDao from "@/src/daos/settingsDao/settingsDao";
import UserDepositDao from "@/src/daos/UserDeposit/UserDepositDao";
import { ObjectId } from "mongodb";
import { getPaginationValues, s3, pick, convertToDecimal } from "@/helpers/helper_functions";
import UserDao from "@/src/daos/user/userDaos";
import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import { StatusCodeEnums, messagesEnglish, statusEnums } from "@/enums/commonEnum/commonEnum";
import PaymentOptionDao from "@/src/daos/paymentOptionDao/paymentOptionDao";
import { paymentOptionOutput } from "@/models/paymentOptionModel/paymentOptionModel";
import updateBalanceInterface from "@/interfaces/updateBalance/updateBalanceInterface";

import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { TransactionTypeEnums } from "@/enums/transactionTypeEnums/transactionTypesEnums";
import adminDepositOptionsList from "@/interfaces/admin/adminDepositOptions/adminDepositOptions";
import adminDepositOptionAdd from "@/interfaces/admin/adminDepositOptionAdd/adminDepositOptionAdd";
import { publishAdminLogs } from "@/connections/rabbitmq/queue/adminLogQueue";
import adminDepositOptionAddResponse from "@/interfaces/admin/adminDepositOptionsAddResponse/adminDepositOptionsAddResponse";
import adminDepositOptionUpdate from "@interfaces/admin/adminDepositOptionUpdate/adminDepositOptionUpdate";
import Flatted from "flatted";
import { adminDepositOptionListResponse } from "@/interfaces/admin/adminDepositOptionListResponse/adminDepositOptionListResponse";
import { logTypeEnums } from "@/enums/logTypeTnums/logTypeEnums";
import {
  UserDepositAdminCountResponse,
  UserDepositAdminList,
  UserDepositAdminListResponse,
} from "@/interfaces/userDeposit/userDepositInterface";
import {
  CreateAdminDepositPayload,
  processAdminDepositPayload,
} from "@/interfaces/processAdminDeposit/processAdminDeposit";
import cashfreePaymentResponse from "@/interfaces/cashfreePayment/cashfreePayment";
import TransactionDao from "@/src/daos/Transaction/TransactionDao";
import { settingsEnums } from "@/enums/settingsEnums/settingsEnums";
import { UserFieldsDeposit } from "@/interfaces/userFields/userFieldsInterface";
import { UserModelOutput } from "@/models/userModel/userModel";
import PayoutCommonService from "../payoutService/payoutCommonService";
import PaymentCommonService from "../paymentService/paymentCommonService";

export default class depositService {
  private settingsDao: SettingsDao;
  private userDepositDao: UserDepositDao;
  private paymentOptionDao: PaymentOptionDao;
  private userDao: UserDao;

  private payoutCommonService: PayoutCommonService;
  private paymentCommonService: PaymentCommonService;
  private transactionDao: TransactionDao;

  constructor() {
    this.settingsDao = new SettingsDao();
    this.userDepositDao = new UserDepositDao();
    this.paymentOptionDao = new PaymentOptionDao();
    this.userDao = new UserDao();
    this.payoutCommonService = new PayoutCommonService();
    this.paymentCommonService = new PaymentCommonService();
    this.transactionDao = new TransactionDao();
  }

  public adminDeposit = async (payload: CreateAdminDepositPayload): Promise<defaultResponseInterface> => {
    try {
      const bonusExpireDays = await this.settingsDao.findOneAndLean({
        sKey: settingsEnums.BONUS_EXPIRE_DAYS,
        eStatus: statusEnums.Y,
      });
      if (!bonusExpireDays)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_found.replace("##", messagesEnglish.cbonusExpirySetting),
        );
      const processDepositResult: boolean = await this.transactionDao.createAdminDeposit({
        ...payload,
        bonusExpireDays,
      });
      if (processDepositResult) {
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.successfully.replace("##", messagesEnglish.cDeposit),
        };
      } else
        throw new HttpException(
          StatusCodeEnums.BAD_REQUEST,
          messagesEnglish.error_with.replace("##", TransactionTypeEnums.DEPOSIT),
        );
    } catch (error) {
      throw error;
    }
  };

  //not in use for now
  /*private kycValidation = async (iUserId: string): Promise<string> => {
    let sErrorMessage: string = "";
    const kycDetails = await this.kycDao.findOneAndLean({
      iUserId,
      $or: [{ "oPan.eStatus": kycStatusEnums.ACCEPTED }, { "oAadhaar.eStatus": kycStatusEnums.ACCEPTED }],
    });

    if (!kycDetails) {
      sErrorMessage = sErrorMessage
        ? sErrorMessage.concat(` ${messagesEnglish.kyc_not_approved}`)
        : sErrorMessage.concat(messagesEnglish.kyc_not_approved);
    }
    if (kycDetails && kycDetails.oPan.eStatus !== kycStatusEnums.ACCEPTED) {
      sErrorMessage = sErrorMessage
        ? sErrorMessage.concat(` ${messagesEnglish.pancard_not_approved}`)
        : sErrorMessage.concat(messagesEnglish.pancard_not_approved);
    }
    if (kycDetails && kycDetails.oAadhaar.eStatus !== kycStatusEnums.ACCEPTED) {
      sErrorMessage = sErrorMessage
        ? sErrorMessage.concat(` ${messagesEnglish.aadharcard_not_approved}`)
        : sErrorMessage.concat(messagesEnglish.aadharcard_not_approved);
    }

    return sErrorMessage;
  }; */

  public adminDepositOptionsList = async (
    payload: adminDepositOptionsList,
  ): Promise<adminDepositOptionListResponse> => {
    try {
      const { start, limit, sorting, search } = getPaginationValues(payload);

      const projection = {
        sName: 1,
        nOrder: 1,
        sImage: 1,
        eKey: 1,
        sOffer: 1,
        bEnable: 1,
        dCreatedAt: 1,
      };
      const sorted: paymentOptionOutput = await this.paymentOptionDao.findAndSort({
        search,
        projection,
        start,
        limit,
        sorting,
      });

      const totalCount: number = await this.paymentOptionDao.countDepositOptionsList(search);

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cpaymentOption),
        data: [{ total: totalCount, results: sorted }],
      };
    } catch (error) {
      throw error;
    }
  };

  public adminGet = async (id: string): Promise<adminDepositOptionAddResponse> => {
    try {
      const paymentOption: paymentOptionOutput = await this.paymentOptionDao.findById(id);
      if (!paymentOption)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cpayoutOption),
        );

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cpayoutOption),
        data: paymentOption,
      };
    } catch (error) {
      throw error;
    }
  };

  public add = async (payload: adminDepositOptionAdd): Promise<adminDepositOptionAddResponse> => {
    try {
      const depositOption: paymentOptionOutput = await this.paymentOptionDao.create({ ...payload });
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.add_success.replace("##", messagesEnglish.snewPaymentOption),
        data: depositOption,
      };
    } catch (error) {
      throw error;
    }
  };

  public update = async (payload: adminDepositOptionUpdate): Promise<adminDepositOptionAddResponse> => {
    try {
      const { sImage, id } = payload;
      const params = pick(payload, ["sName", "nOrder", "sImage", "sOffer", "bEnable"]);

      const paymentOptionUpdate = await this.paymentOptionDao.updateOption(id, { ...params });
      if (!paymentOptionUpdate)
        throw new HttpException(
          StatusCodeEnums.NOT_FOUND,
          messagesEnglish.not_exist.replace("##", messagesEnglish.cpaymentOption),
        );

      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: paymentOptionUpdate.sImage,
      };

      let paymentOption;
      if (s3Params && paymentOptionUpdate.sImage !== sImage) {
        paymentOption = await s3.deleteObject(s3Params); // we'll remove old image also from s3 bucket list
        paymentOption = Flatted.stringify(paymentOption);
      }
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.update_success.replace("##", messagesEnglish.cpaymentOptionDetails),
        data: paymentOption || paymentOptionUpdate,
      };
    } catch (error) {
      throw error;
    }
  };

  public depositOptionsList = async (): Promise<paymentOptionOutput> => {
    try {
      return await this.paymentOptionDao.listAll();
    } catch (error) {
      throw error;
    }
  };

  public updateBalance = async (
    payload: updateBalanceInterface,
  ): Promise<{
    alreadySuccess: boolean;
    status: StatusCodeEnums;
    message: string;
    ePaymentStatus: paymentStatusEnum;
  }> => {
    try {
      
      // TODO-ISSUE move all transaction function to DAO
      return await this.transactionDao.userDepositUpdateBalance(payload);
    } catch (error) {
      throw error;
    }
  };


  public adminProcessDeposit = async (payload: processAdminDepositPayload): Promise<defaultResponseInterface> => {
    try {
      const isProcessDeposit: boolean = await this.transactionDao.processAdminDeposit(payload);
      if (isProcessDeposit)
        return {
          status: StatusCodeEnums.OK,
          message: messagesEnglish.successfully.replace("##", messagesEnglish.cprocessedDeposit),
        };
      else throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.depo_already_process);
    } catch (error) {
      throw error;
    }
  };

  public adminList = async (payload: UserDepositAdminList): Promise<UserDepositAdminListResponse> => {
    try {
      const { query, aUsersList } = payload;
      const data = await this.userDepositDao.adminList({ ...payload, query, aUsersList });
      const aUserIds = [];
      const aUserList: UserModelOutput[] = [];

      if (data.length) {
        data.forEach((record) => {
          if (!aUsersList.includes((user) => user._id.toString() === record.iUserId.toString())) {
            aUserIds.push(record.iUserId.toString());
          }
        });

        if (aUserIds.length) {
          const aWithdrawUsers = await this.userDao.findAll(
            { _id: { $in: aUserIds } },
            { sName: 1, sUsername: 1, sMobNum: 1 },
          );

          if (aWithdrawUsers.length) aUserList.push(...aWithdrawUsers);
        }
      }
      const depositData: UserDepositOutput[] = await this.addUserFields(data, aUserList);
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", messagesEnglish.cDeposit),
        data: { rows: depositData },
      };
    } catch (error) {
      throw error;
    }
  };

  public adminVerifyOrder = async (payload: cashfreePaymentResponse): Promise<defaultResponseInterface> => {
    try {
      const postData = payload;
      const { data } = postData;
      if (!data) throw new HttpException(StatusCodeEnums.BAD_REQUEST, messagesEnglish.error);
      const { order, payment } = data;
      // console.log({ postData })
      const { order_id: orderId = "" } = order;
      const { payment_status: paymentStatus, cf_payment_id: iTransactionId } = payment;

      const oDeposit = await this.userDepositDao.findUserDepositByOrderId(orderId);
      if (!oDeposit)
        throw new HttpException(
          StatusCodeEnums.BAD_REQUEST,
          messagesEnglish.not_found.replace("##", messagesEnglish.cDeposit),
        );

      const logData = {
        iDepositId: oDeposit.id || "",
        iOrderId: oDeposit.iOrderId || orderId,
        iTransactionId,
        eGateway: oDeposit.ePaymentGateway,
        eType: logTypeEnums.DEPOSIT,
        oReq: { sInfo: `${oDeposit.ePaymentGateway} payment gateway webhook(v2) event called.` },
        oRes: postData,
      };
      await publishAdminLogs(logData);
      //apiLogServices.saveTransactionLog(logData);

      // Calculate GST on Deposited Amount
      const { oGST } = await this.paymentCommonService.calculateGST(oDeposit.nCash.toString())
      oDeposit.nBonus = parseFloat(oDeposit.nBonus.toString()) + parseFloat(`${oGST.nRepayBonusAmount}`)

      const updateData = {
        txStatus: paymentStatus === paymentStatusEnum.USER_DROPPED ? paymentStatusEnum.FAILED : paymentStatus,
        orderId,
        referenceId: `${iTransactionId}`,
        oGST
      };

      const { status: resStatus, message } = await this.updateBalance(updateData);
      if (resStatus && message) return { status: resStatus, message };
    } catch (error) {
      throw error;
    }
  };

  // To get counts of deposits with searching and filter
  public getCounts = async (payload: UserDepositAdminList): Promise<UserDepositAdminCountResponse> => {
    try {
      const { status, method, search } = payload;
      const { query } = await this.payoutCommonService.adminWithdrawListQuery(
        status,
        method,
        search,
        logTypeEnums.DEPOSIT,
      );
      const count: number = await this.userDepositDao.depositCounts({ ...payload, query });
      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", `${messagesEnglish.cDeposit} ${messagesEnglish.cCounts}`),
        data: count,
      };
    } catch (error) {
      throw error;
    }
  };

  public addUserFields = async (payload: UserDepositOutput[], users = []): Promise<UserFieldsDeposit[]> => {
    let data;
    const oUser = {};

    if (users.length) {
      data = users;
    } else {
      const userIds = payload.map((p) => new ObjectId(p.iUserId));
      data = await this.userDao.findAllUsersByDepositIds(userIds);
    }
    data.forEach((usr, i) => {
      oUser[usr._id.toString()] = i;
    });

    return payload.map((p) => {
      const user = typeof oUser[p.iUserId.toString()] === "number" ? { ...data[oUser[p.iUserId.toString()]] } : {};
      // const user = data.find(u => u._id.toString() === p.iUserId.toString())
      return { ...p, ...user, _id: undefined };
    });
  };
}