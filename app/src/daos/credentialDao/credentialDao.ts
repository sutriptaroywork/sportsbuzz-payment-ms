import CredentialModel, { CredentialModelInput, CredentialModelOutput } from "@/models/credentialModel/credentialModel";
import BaseMongoDao from "../baseMongoDao";

export class credentialDao extends BaseMongoDao<CredentialModelInput, CredentialModelOutput> {
  constructor() {
    super(CredentialModel);
  }

  public findOneAndCache = async (query: any, projection?: any): Promise<CredentialModelOutput> => {
    return await this.model.findOne(query, projection).lean();
  };
}
