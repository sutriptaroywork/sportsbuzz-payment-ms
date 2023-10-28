import bankModel, { bankModelInput, bankModelOutput } from "@/models/bankModel/bankModel";
import BaseMongoDao from "../baseMongoDao";
import { UserModelAttributes } from "@/interfaces/user/userInterface";
import { BankPopulate } from "@/interfaces/bankModel/bankModelInterface";

export default class bankDao extends BaseMongoDao<bankModelInput, bankModelOutput> {
  constructor() {
    super(bankModel);
  }


  public bankModelPopulate = async (query: { iUserId: string }): Promise<BankPopulate> => {
    return await this.model
      .findOne(query, {}, { readPreference: "primary" })
      .populate([
        {
          path: "iUserId",
          select: "iStateId iCityId sAddress nPinCode sMobNum sEmail",
          populate: { path: "iStateId iCityId" },
        },
      ])
      .lean();
  };
}
