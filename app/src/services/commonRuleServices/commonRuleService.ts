import CommonRuleDao from "@/src/daos/commonRule/commonRuleDao";
import { CommonRuleModelOutput } from "@/models/commonRuleModel/commonRuleModel";

export default class CommonRuleService {
  private commonRuleDao: CommonRuleDao;

  constructor() {
    this.commonRuleDao = new CommonRuleDao();
  }

  public findRule = async (rule: string): Promise<CommonRuleModelOutput> => {
    return await this.commonRuleDao.findRule(rule);
  };
}
