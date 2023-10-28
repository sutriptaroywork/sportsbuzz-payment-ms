import UserWithdrawModel, { userWithdrawInput, userWithdrawOutput } from "@/models/userWithdrawModel/userWithdrawModel";
import BaseSqlDao from "../baseSqlDao";
import { Op } from "sequelize";
import { payoutStatusEnums } from "@/enums/payoutStatusEnums/payoutStatusEnums";
import { ObjectId } from "mongodb";
import { StatusCodeEnums, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { UserTypeEnums } from "@/enums/userTypeEnums/userTypeEnums";
import { defaultSearch } from "@/helpers/helper_functions";
import { logTypeEnums } from "@/enums/logTypeTnums/logTypeEnums";

import { paymentStatusEnum } from "@/enums/paymentStatusEnums/paymentStatusEnums";
import {
  adminWithdrawCountResponse,
  adminWithdrawListInterface,
} from "@/interfaces/admin/adminWithdrawList/adminWithdrawList";
import { UserModelOutput } from "@/models/userModel/userModel";

export default class userWithdrawDao extends BaseSqlDao<userWithdrawInput, userWithdrawOutput> {
  constructor() {
    super(UserWithdrawModel);
  }

  public findAllWithdraws = async (
    query: any[],
    sort: string,
    orderBy: string,
    datefrom: string,
    dateto: string,
    isFullResponse: boolean | string,
    start: number,
    limit: number,
  ): Promise<userWithdrawOutput[]> => {
    if (datefrom && dateto) {
      query.push({ dWithdrawalTime: { [Op.gte]: datefrom } });
      query.push({ dWithdrawalTime: { [Op.lte]: dateto } });
    }

    const paginationFields = [true, "true"].includes(isFullResponse)
      ? {}
      : {
          offset: Math.round(start),
          limit: Math.round(limit),
        };

    return await this.model.findAll({
      where: {
        [Op.and]: query,
      },
      order: [[sort, orderBy]],
      ...paginationFields,
      raw: true,
    });
  };

  public findWithdrawCountInRange = async ({
    currentDate,
    fromDate,
    iUserId,
  }: {
    currentDate: string;
    fromDate: string;
    iUserId: string | ObjectId;
  }): Promise<number> => {
    try {
      const count: number = await await this.model.count({
        where: {
          iUserId,
          dCreatedAt: {
            [Op.lte]: currentDate,
            [Op.gte]: fromDate,
          },
        },
      });
      return count;
    } catch (error) {
      throw error;
    }
  };

  public findInitiatedWithdraws = async (dCurrentTime: Date): Promise<userWithdrawOutput[]> => {
    return await this.model.findAll({
      where: {
        ePaymentStatus: payoutStatusEnums.INITIATED,
        [Op.and]: [
          {
            dUpdatedAt: { [Op.gte]: dCurrentTime },
          },
          {
            dUpdatedAt: { [Op.lte]: new Date() },
          },
        ],
      },
      raw: true,
      order: [["dUpdatedAt", "DESC"]],
    });
  };

  public getAdminWithdrawDepositListQuery = async (
    ePaymentStatus: string,
    ePaymentGateway: string,
    sSearch: string,
    sFlag: string,
    aUsers: UserModelOutput[],
    bReversedFlag?: string,
  ): Promise<{ query: any; aUsers: any }> => {
    const query = [];

    if (ePaymentStatus) {
      query.push({ ePaymentStatus });
    }

    if (ePaymentGateway) {
      query.push({ ePaymentGateway });
    }

    if (bReversedFlag && ["y", "n"].includes(bReversedFlag)) {
      const bReversed = bReversedFlag === "y";
      query.push({ bReversed });
    }

    if (sSearch) sSearch = defaultSearch(sSearch);

    if (sSearch && sSearch.length) {
      const aSearchQuery = [];
      const nSearchNumber = Number(sSearch);
      if (!isNaN(nSearchNumber)) {
        const userIds = aUsers.map((user) => user._id.toString());

        if (aUsers.length) {
          aSearchQuery.push({
            [Op.or]: [{ id: { [Op.like]: nSearchNumber + "%" } }, { iUserId: { [Op.in]: userIds } }],
          });
        } else {
          aSearchQuery.push({ id: nSearchNumber });
        }
      } else {
        if (aUsers.length > 0) {
          const userIds = aUsers.map((user) => user._id.toString());
          aSearchQuery.push({ iUserId: { [Op.in]: userIds } });
        }
      }
      if (sFlag === "D") {
        aSearchQuery.push({ iTransactionId: { [Op.like]: sSearch + "%" } });
        aSearchQuery.push({ iOrderId: { [Op.like]: sSearch + "%" } });
      }
      query.push({ [Op.or]: aSearchQuery });
    }
    return { query, aUsers };
  };

  public checkWithdrawStatus = async (
    iUserId: string,
  ): Promise<{ userWithdraw: userWithdrawOutput; bFlag: boolean }> => {
    let bFlag = true;
    const userWithdraw = await this.model.findOne({
      where: {
        iUserId,
        ePaymentStatus: { [Op.in]: [payoutStatusEnums.PENDING, payoutStatusEnums.ON_HOLD] },
        ePaymentGateway: { [Op.ne]: paymentGatewayEnums.ADMIN },
      },
    });
    if (!userWithdraw) {
      bFlag = false;
    }
    return { userWithdraw, bFlag };
  };

  public findOnePendingWithUserId = async (iUserId: string): Promise<userWithdrawOutput> => {
    return this.model.findOne({ where: { iUserId, ePaymentStatus: paymentStatusEnum.PENDING }, raw: true });
  };

  public adminGetCounts = async (
    payload: adminWithdrawListInterface,
    aUsers: UserModelOutput[],
  ): Promise<adminWithdrawCountResponse> => {
    try {
      const { search, status: paymentStatus, method, datefrom, dateto, reversedFlag, isFullResponse } = payload;

      const { query } = await this.getAdminWithdrawDepositListQuery(
        paymentStatus,
        method,
        search,
        logTypeEnums.WITHDRAW,
        aUsers,
        reversedFlag,
      );

      if (datefrom && dateto) {
        query.push({ dWithdrawalTime: { [Op.gte]: datefrom } });
        query.push({ dWithdrawalTime: { [Op.lte]: dateto } });
      }

      if ([true, "true"].includes(isFullResponse)) query.push({ eUserType: UserTypeEnums.USER });

      const count: number = await this.model.count({
        where: {
          [Op.and]: query,
        },
        raw: true,
      });

      return {
        status: StatusCodeEnums.OK,
        message: messagesEnglish.success.replace("##", `${messagesEnglish.withdraw} ${messagesEnglish.cCounts}`),
        data: { count },
      };
    } catch (error) {
      throw error;
    }
  };
}
