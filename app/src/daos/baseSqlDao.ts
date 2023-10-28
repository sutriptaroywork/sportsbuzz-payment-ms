import sequelizeConnection from "@/connections/database/mysql/mysql";

export default class BaseSqlDao<InputT, OutputT> {
  model: any;
  transaction: any;

  constructor(model: any) {
    this.model = model;
    this.transaction = sequelizeConnection.sequelize.transaction;
  }

  public create = async (data: any, arg2: { transaction: any; lock: boolean }): Promise<OutputT> => {
    const created = await this.model.create(data, { ...arg2 });
    return created.toJSON();
  };

  public findAndCountAll = async (data: any): Promise<any> => {
    return await this.model.findAndCountAll(data);
  };

  public findAll = async (args: any): Promise<OutputT[]> => {
    return await this.model.findAll(args);
  };

  public findOne = async (data: any): Promise<OutputT> => {
    return await this.model.findOne({ ...data, raw: true });
  };

  public update = async (arg1: any, arg2: any): Promise<OutputT> => {
    return await this.model.update(arg1, arg2);
  };

  public sum = async (column: any, query: any): Promise<number> => {
    return await this.model.sum(column, query);
  };
}
