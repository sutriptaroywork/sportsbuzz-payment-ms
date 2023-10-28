import { statusEnums } from "@/enums/commonEnum/commonEnum";
import settingsDao from "@/src/daos/settingsDao/settingsDao";

export default class settingServices {
  private settingsDao: settingsDao;

  constructor() {
    this.settingsDao = new settingsDao();
  }

  public findSetting = (key: string) => {
    // TODO-ISSUE use enum for eStatus
    return this.settingsDao.findOneAndLean({ sKey: key, eStatus: statusEnums.Y });
  };
}
