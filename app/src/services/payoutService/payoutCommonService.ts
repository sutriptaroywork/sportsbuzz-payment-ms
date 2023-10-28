import UserDao from "@/src/daos/user/userDaos";
import userWithdrawDao from "@/src/daos/userWithdraw/userWithdrawDao";

export default class PayoutCommonService {
    private userDao: UserDao;
    private userWithdrawDao: userWithdrawDao;
    constructor(){
        this.userDao = new UserDao();
        this.userWithdrawDao = new userWithdrawDao();
    }

    public adminWithdrawListQuery = async (
    ePaymentStatus: string,
    ePaymentGateway: string,
    sSearch: string,
    sFlag: string,
    bReversedFlag?: string,
  ): Promise<{ query: any; aUsers: any }> => {
    try {
      let aUsers = [];
      const nSearchNumber = Number(sSearch);
      if (!isNaN(nSearchNumber)) {
        aUsers = await this.userDao.findAllUsersWithRegex(sSearch);
      } else {
        aUsers = await this.userDao.findAllUsersWithRegex(sSearch);
      }
      const queryResponse = await this.userWithdrawDao.getAdminWithdrawDepositListQuery(
        ePaymentStatus,
        ePaymentGateway,
        sSearch,
        "D",
        aUsers
      );
      return queryResponse;
    } catch (error) {
      throw error;
    }
  };
}