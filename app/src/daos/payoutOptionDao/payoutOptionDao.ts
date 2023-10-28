import payoutOptionModel, { payoutOptionInput, payoutOptionOutput } from "@/models/payoutOptionModel/payoutOptionModel";
import BaseMongoDao from "../baseMongoDao";

export default class payoutOptionDao extends BaseMongoDao<payoutOptionInput, payoutOptionOutput> {
  constructor() {
    super(payoutOptionModel);
  }

  public listAll = async (): Promise<payoutOptionOutput[]> => {
    return await this.model.find().lean();
  };

  public findAndSort = async ({ query, projection, sorting, start, limit }): Promise<payoutOptionOutput> => {
    return await this.model.find(query, projection).sort(sorting).skip(Number(start)).limit(Number(limit)).lean();
  };
}
