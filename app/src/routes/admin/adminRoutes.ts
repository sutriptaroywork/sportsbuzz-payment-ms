import Routes from "../index";
import { Router } from "express";
import adminController from "@/src/controllers/adminController/adminController";
import UserBalanceService from "@/src/services/userBalanceService/userBalanceService";

export default class adminRoutes implements Routes {
  public path: string;
  public router: Router;
  private adminController: adminController;

  constructor() {
    this.path = "/";
    this.router = Router();
    this.adminController = new adminController();
    this.initializeRoutes();
  }

  private initializeRoutes = (): void => {
    // Admin balance APIs
    this.router.get(`${this.path}balance/:id`, this.adminController.adminGetBalance);

    //Passbook APIs
    this.router.get(`${this.path}passbooks/list`, this.adminController.adminPassbookList);
    this.router.get(`${this.path}passbook/:iUserId`, this.adminController.adminUserDetails);
    this.router.get(`${this.path}system-user/passbook/:iUserId`, this.adminController.adminUserDetails);
    this.router.get(`${this.path}passbooks/count`, this.adminController.adminPassbookCount);
    this.router.get(`${this.path}passbooks/matchLeagueList/:id`, this.adminController.adminPassbookMatchLeagueList);
    this.router.get(`${this.path}passbooks/matchLeagueCount/:id`, this.adminController.adminPassbookMatchLeagueCount);
    this.router.post(`${this.path}passbooks/transactionReport`, this.adminController.adminPassbookTransactionReport);
    this.router.get(
      `${this.path}passbooks/transactionReportList`,
      this.adminController.adminPassbookTransactionReportList,
    );

    //Deposit options APIs
    this.router.get(`${this.path}depositOptions/list`, this.adminController.adminDepositOptionsList);
    this.router.get(`${this.path}depositOption/:id`, this.adminController.adminDepositOptionGet);
    this.router.post(`${this.path}depositOptions/add`, this.adminController.adminDepositOptionAdd);
    this.router.put(`${this.path}depositOptions/update`, this.adminController.adminDepositOptionUpdate);
    //this.router.post(`${this.path}depositOptions/getSignedUrl`, this.adminController.getSignedUrlDepositOptionResponse); not in use

    //Payout options APIs
    this.router.get(`${this.path}payoutOptions/list`, this.adminController.adminPayoutOptionsList);
    this.router.get(`${this.path}payoutOption/:id`, this.adminController.adminPayoutOptionGet);
    this.router.post(`${this.path}payoutOptions/add`, this.adminController.adminPayoutOptionAdd);
    this.router.put(`${this.path}payoutOptions/update`, this.adminController.adminPayoutOptionUpdate);
   // this.router.post(`${this.path}payoutOptions/getSignedUrl`, this.adminController.getSignedUrlPayoutOptionResponse); not in use

    //Admin deposit APIs
    this.router.post(`${this.path}deposits/create`, this.adminController.adminDepositCreate);
    this.router.post(`${this.path}deposit/:id`, this.adminController.adminProcessDeposit);
    this.router.get(`${this.path}deposits/list`, this.adminController.adminDepositList);
    this.router.get(`${this.path}deposits/counts`, this.adminController.adminDepositCount);
    this.router.post(`${this.path}deposits/process/:id`, this.adminController.adminProcessDeposit);
    this.router.post(`${this.path}deposits/verifyAppPayment`, this.adminController.adminVerifyAppPayment);

    //TDS routes
    this.router.get(`${this.path}TDS/list`, this.adminController.adminTdsList);
    this.router.get(`${this.path}TDS/matchLeagueList`, this.adminController.matchLeagueTdsList);
    this.router.get(`${this.path}TDS/matchLeagueCount`, this.adminController.matchLeagueTdsCount);
    this.router.get(`${this.path}TDS/count`, this.adminController.adminTdsCount);
    this.router.put(`${this.path}TDS/update`, this.adminController.tdsUpdate);
    this.router.post(`${this.path}TDS/process-tds`, this.adminController.processTDSEndOfYear);

    //Admin wtihdraw APIs
    this.router.get(`${this.path}withdraws/list`, this.adminController.adminWithdrawList);
    this.router.get(`${this.path}withdraws/count`, this.adminController.adminWithdrawCount);
    this.router.get(`${this.path}withdraws/is-debugger-mismatch/:iUserId`,this.adminController.isDebuggerMismatchOfWithdrawId);
    this.router.post(`${this.path}withdraw/process`, this.adminController.adminWithdrawProcess);
    this.router.post(`${this.path}withdraws/create`, this.adminController.adminWithdrawCreate);
    this.router.post(`${this.path}withdraws/cashfree-webhook`, this.adminController.adminWithdrawCashfreeWebhook);
  };
}
