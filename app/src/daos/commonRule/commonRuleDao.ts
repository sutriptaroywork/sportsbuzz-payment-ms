import { dbCache, statusEnums } from "@/enums/commonEnum/commonEnum";
import CommonRuleModel, { CommonRuleModelInput, CommonRuleModelOutput } from "@/models/commonRuleModel/commonRuleModel";
import BaseMongoDao from "../baseMongoDao";

export default class CommonRuleDao extends BaseMongoDao<CommonRuleModelInput, CommonRuleModelOutput> {
  constructor() {
    super(CommonRuleModel);
  }

  /**
   * This Method is used to find the common rule.
   * @param rule
   * @returns
   */
  public findRule = async (rule: string): Promise<CommonRuleModelOutput> => {
    return await this.model.findOne({
      eRule: rule.toUpperCase(),
      eStatus: statusEnums.Y,
    });
  };
}
