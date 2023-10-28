
// import
export default class BaseMongoDao<InputT, OutputT> {
  model: any;

  constructor(model: any) {
    this.model = model;
  }

  public countDocuments = async (args: any): Promise<number> => {
    return await this.model.countDocuments(args);
  };

  public findById = async (id: string, projection?: any): Promise<OutputT> => {
    let result = await this.model.findById(id, projection).lean();
    return result;
  };

  public create = async (input: InputT): Promise<OutputT> => {
    let result = await this.model.create(input);
    return result;
  };

  public findOneAndLean = async (input: any, projection?: any): Promise<OutputT> => {
    return await this.model.findOne(input, projection).lean();
  };

  public updateOne = async (arg1: any, arg2: any, arg3: any): Promise<OutputT> => {
    return await this.model.updateOne(arg1, arg2, arg3).lean();
  };

  public findOne = async (query: object, projection?: object, readPreference?: object): Promise<OutputT> => {
    return await this.model.findOne(query, projection, readPreference);
  };

  public findAll = async (query: object, projection?: object, readPreference?: object): Promise<OutputT[]> => {
    return await this.model.find(query, projection, readPreference).lean();
  };

  public populate = async (arg1: string, arg2?: string): Promise<OutputT> => {
    return await this.model.populate(arg1, arg2);
  };

  // public startMongoTransaction = () : ClientSession =>  {
  //     return db.startTransaction()
  // }

  // public getAllPaginated = (limit : number, offset : number, sort: {field : string, order: string} = null, filter : null): Promise<{ rows: OutputT[]; count: number }> => {
  //     let orderArr: Array<Array<string>> = [];
  // }
}
