import KycModel, { KycModelInput, KycModelOutput } from "@/models/kycModel/kycModel";
import BaseMongoDao from "../baseMongoDao";
import { ObjectId } from "mongoose";
import { kycStatusEnums } from "@/enums/kycStatusEnums/kycStatusEnums";

export default class kycDao extends BaseMongoDao<KycModelInput, KycModelOutput> {
  constructor() {
    super(KycModel);
  }

  public findOneAndLean = async (input: any, projection?: any): Promise<KycModelOutput> => {
    return await this.model.findOne(input, projection).lean();
  };

  public findAcceptedKyc = async (iUserId: any): Promise<KycModelOutput> => {
    return await this.findOneAndLean({
        iUserId,
        $or: [{ "oPan.eStatus": kycStatusEnums.ACCEPTED }, { "oAadhaar.eStatus": kycStatusEnums.ACCEPTED }],
      })
  }
}
