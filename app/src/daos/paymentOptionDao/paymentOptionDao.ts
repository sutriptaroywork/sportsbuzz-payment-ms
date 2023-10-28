import paymentOptionModel from "@/models/paymentOptionModel/paymentOptionModel";
import { paymentOptionInput, paymentOptionOutput } from "@/models/paymentOptionModel/paymentOptionModel";
import BaseMongoDao from "../baseMongoDao";
import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";

export default class PaymentOptionDao extends BaseMongoDao<paymentOptionInput, paymentOptionOutput> {
  constructor() {
    super(paymentOptionModel);
  }

  public findAndSort = async ({ search, projection, sorting, start, limit }): Promise<paymentOptionOutput> => {
    const query = search ? { sName: { $regex: new RegExp("^.*" + search + ".*", "i") } } : {};
    return await this.model.find(query, projection).sort(sorting).skip(Number(start)).limit(Number(limit)).lean();
  };

  public countDepositOptionsList = async (search: any): Promise<number> => {
    const query = search ? { sName: { $regex: new RegExp("^.*" + search + ".*", "i") } } : {};
    return await this.model.countDocuments({ ...query });
  };

  public countDepositOptions = async (eType: paymentOptionEnums): Promise<number> => {
    return await this.model.countDocuments({ eKey: eType, bEnable: true });
  };

  public listAll = async (): Promise<paymentOptionOutput> => {
    return await this.model.find({}, { sKey: 0 }).lean();
  };

  public updateOption = async (id: string, params: any): Promise<paymentOptionOutput> => {
    return await this.model.updateOne(id, params, { new: true, runValidators: true }).lean();
  };
}
