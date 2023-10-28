import { StatusCodeEnums, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import { logTypeEnums } from "@/enums/logTypeTnums/logTypeEnums";
import { getSignedUrl } from "@/helpers/helper_functions";
import { AdminBalanceDataOutput } from "@/interfaces/admin/adminBalanceData/adminBalanceData";
import { adminDepositOptionListResponse } from "@/interfaces/admin/adminDepositOptionListResponse/adminDepositOptionListResponse";
import { adminWithdrawListInterface } from "@/interfaces/admin/adminWithdrawList/adminWithdrawList";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { extendedRequest } from "@/interfaces/extendedRequest/extendedRequest";
import { PassbookAdminCounts } from "@/interfaces/passBook/passbookAdminCounts/passbookAdminCounts";
import { generateReportPayloadInterface, passbookAdminList, passbookAdminListResponse, passbookMatchLeagueWiseList } from "@/interfaces/passBook/passbookAdminList/passbookAdminListInterface";
import transactionReportListInterface, { transactionListPayload } from "@/interfaces/passBook/transactionListInterface/transactionListInterface";
import { AdminTDSCountResponse, AdminTDSListInterface, AdminTDSListResponse, AdminTDSMatchLeagueListInterface, AdminTDSupdateResponse } from "@/interfaces/tds/adminTDSList/adminTDSList";
import { UserDepositAdminList } from "@/interfaces/userDeposit/userDepositInterface";
import { UserDetailsResponse } from "@/interfaces/userDetails/userDetailsObject";
import { UserBalanceOutput } from "@/models/userBalanceModel/userBalanceModel";
import { cashfreeService } from "@/src/services/cashfreeService/cashfreeService";
import depositService from "@/src/services/depositService/depositService";
import { passbookService } from "@/src/services/passbookService/passbookService";
import PayoutCommonService from "@/src/services/payoutService/payoutCommonService";
import payoutService from "@/src/services/payoutService/payoutService";
import tdsService from "@/src/services/tdsService/tdsService";
import UserBalanceService from "@/src/services/userBalanceService/userBalanceService";
import webhookService from "@/src/services/webhookService/webhookService";
import { NextFunction, Request, Response } from "express";

export default class adminController {
  private userBalanceService: UserBalanceService;
  private passbookService: passbookService;
  private depositService: depositService;
  private payoutCommonService: PayoutCommonService;
  private payoutService: payoutService;
  private webhookService: webhookService;
  private tdsService: tdsService;
  private cashfreeService: cashfreeService;

  constructor() {
    this.userBalanceService = new UserBalanceService();
    this.passbookService = new passbookService();
    this.depositService = new depositService();
    this.payoutCommonService = new PayoutCommonService();
    this.payoutService = new payoutService();
    this.webhookService = new webhookService();
    this.tdsService = new tdsService();
    this.cashfreeService = new cashfreeService();
  }

  //Admin Passbook
  public adminGetBalance = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } : { id: string } = req.params as any
      const result : UserBalanceOutput | AdminBalanceDataOutput = await this.userBalanceService.adminGet(id);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminUserDetails = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result : UserDetailsResponse = await this.passbookService.userDetails(req.params.iUserId);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminDepositOptionsList = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { start, limit, sorting, search, order } = req.query as any;
      const payload = { start, limit, sorting, search, order };
      const { data } : adminDepositOptionListResponse = await this.depositService.adminDepositOptionsList(payload);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };

  public adminPayoutOptionsList = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { start, limit, sort, order, search, status, method, datefrom, dateto, isFullResponse, reversedFlag } =
        req.query as any;
      const payload = {
        start,
        limit,
        sort,
        order,
        search,
        status,
        method,
        datefrom,
        dateto,
        isFullResponse,
        reversedFlag,
      };
      const { data } = await this.payoutService.adminPayoutOptionsList(payload);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };


  public adminDepositOptionGet = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const paymentOptionId = req.params.id;
      const { data } = await this.depositService.adminGet(paymentOptionId);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };

  public adminPayoutOptionGet = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { data } = await this.payoutService.adminGet(id);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };

  public adminDepositOptionAdd = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = { ...req.body };
      const data = await this.depositService.add(payload);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };

  public adminPayoutOptionAdd = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = { ...req.body };
      const data = await this.payoutService.add(payload);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };
  public adminDepositOptionUpdate = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = { ...req.body };
      const data = await this.depositService.update(payload);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };

  public adminPayoutOptionUpdate = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = { ...req.body };
      const data = await this.payoutService.update(payload);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getSignedUrlDepositOptionResponse = async (
    req: extendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const payload = { ...req.body };
      const { data } = await getSignedUrl(payload);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getSignedUrlPayoutOptionResponse = async (
    req: extendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const payload = { ...req.body };
      const { data } = await getSignedUrl(payload);
      res.status(StatusCodeEnums.OK).json(data);
    } catch (error) {
      next(error);
    }
  };

  public adminPassbookList = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        start,
        limit,
        sort,
        order,
        search,
        searchType,
        datefrom,
        id,
        dateto,
        particulars,
        type,
        isFullResponse,
        eStatus,
        eUserType,
        sportsType,
      } = req.query as any;
      const payload : passbookAdminList = {
        start,
        limit,
        sort,
        order,
        search,
        searchType,
        id,
        datefrom,
        dateto,
        particulars,
        type,
        isFullResponse,
        eStatus,
        eUserType,
        sportsType,
      };
      const result : passbookAdminListResponse = await this.passbookService.adminList(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminPassbookCount = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        start,
        limit,
        sort,
        order,
        search,
        searchType,
        datefrom,
        dateto,
        particulars,
        type,
        id,
        isFullResponse,
        eStatus,
        eUserType,
        sportsType,
      } = req.query as any;
      const payload : passbookAdminList = {
        start,
        limit,
        sort,
        order,
        search,
        searchType,
        datefrom,
        dateto,
        particulars,
        type,
        id,
        isFullResponse,
        eStatus,
        eUserType,
        sportsType,
      };
      const result : PassbookAdminCounts = await this.passbookService.adminGetCounts(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminPassbookMatchLeagueList = async (
    req: extendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const reqParams = req.query as any
      const payload : passbookMatchLeagueWiseList = { ...reqParams, iMatchLeagueId: req.params.id };
      const result = await this.passbookService.matchLeagueWiseList(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminPassbookMatchLeagueCount = async (
    req: extendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const reqParams = req.query as any
      const payload : passbookMatchLeagueWiseList = { ...reqParams, iMatchLeagueId: req.params.id };      
      const result : PassbookAdminCounts = await this.passbookService.matchLeagueWiseCount(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminPassbookTransactionReport = async (
    req: extendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const payload : generateReportPayloadInterface = { ...req.body, iAdminId: req.body.iAdminId };
      const result : defaultResponseInterface = await this.passbookService.transactionReport(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminPassbookTransactionReportList = async (
    req: extendedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const reqParams :  transactionListPayload = req.query as any
      const result : transactionReportListInterface = await this.passbookService.listTransactionReport(reqParams);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  //Admin deposit
  public adminDepositCreate = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = { ...req.body };
      const result = await this.depositService.adminDeposit(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminProcessDeposit = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const payload = { ...req.body, id: req.params.id };
      const result = await this.depositService.adminProcessDeposit(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminDepositList = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqParams : UserDepositAdminList = req.query as any
      const { status, method, search } = reqParams
      const { query, aUsers: aUsersList } = await this.payoutCommonService.adminWithdrawListQuery(status, method, search, logTypeEnums.DEPOSIT);
      const result = await this.depositService.adminList({...reqParams, query, aUsersList});
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminDepositCount = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqParams : UserDepositAdminList = req.query as any;
      const result = await this.depositService.getCounts(reqParams);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  //Admin withdraw controllers
  public adminWithdrawList = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { start, limit, sort, order, search, status, method, datefrom, dateto, isFullResponse, reversedFlag } =
        req.query as any;
      const payload = {
        start,
        limit,
        sort,
        order,
        search,
        status,
        method,
        datefrom,
        dateto,
        isFullResponse,
        reversedFlag,
      };
      const result = await this.payoutService.adminList(payload);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminWithdrawCount = async (req: extendedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reqParams : adminWithdrawListInterface = req.query as any
      const result = await this.payoutService.adminGetCounts(reqParams);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public isDebuggerMismatchOfWithdrawId = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const {iUserId} = req.params;
      const isMismatch : boolean = await this.payoutService.isPaymentDebuggerMismatch(iUserId);
      return res.status(StatusCodeEnums.OK).jsonp({
        status: StatusCodeEnums.OK,
        message: messagesEnglish.action_success.replace("##", messagesEnglish.withdraw),
        data: { isMismatch: isMismatch },
      });
    } catch (error) {
      next(error);
    }
  };

  public adminWithdrawProcess = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const result : defaultResponseInterface = await this.payoutService.adminProcessWithdraw(req.body);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminWithdrawCreate = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const result : defaultResponseInterface = await this.payoutService.adminWithdraw(req.body);
      console.log(result)
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminWithdrawCashfreeWebhook = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const result : defaultResponseInterface = await this.webhookService.cashfreeWebhook(req.body);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminVerifyAppPayment = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.cashfreeService.verifyAppPayment(req.body);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminTdsList = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const reqParams : AdminTDSListInterface = req.params as any
      const result = await this.tdsService.adminList(reqParams);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public adminTdsCount = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const reqParams : AdminTDSListInterface = req.params as any
      const result = await this.tdsService.adminCounts(reqParams);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public processTDSEndOfYear = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const result : defaultResponseInterface = await this.tdsService.processTDSEndOfYear();
      res.status(StatusCodeEnums.CREATE).json(result);
    } catch (error) {
      next(error);
    }
  };

  public matchLeagueTdsList = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const reqParams : AdminTDSMatchLeagueListInterface = req.query as any
      const result : AdminTDSListResponse = await this.tdsService.matchLeagueTdsList(reqParams);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public matchLeagueTdsCount = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const reqParams : AdminTDSMatchLeagueListInterface = req.query as any
      const result : AdminTDSCountResponse = await this.tdsService.matchLeagueTdsCount(reqParams);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };

  public tdsUpdate = async (req: extendedRequest, res: Response, next: NextFunction) => {
    try {
      const result : AdminTDSupdateResponse = await this.tdsService.adminUpdate(req.body);
      res.status(StatusCodeEnums.OK).json(result);
    } catch (error) {
      next(error);
    }
  };
}