import { JuspayFlagEnums } from "@/enums/flagEnums/flagEnums";
import axios from "axios";

export class JuspayUtils {
  private apiKey: string;
  private merchantId: string;
  private juspayBaseUrl: string;
  private version: string;

  constructor() {
    this.apiKey = process.env.JUSPAY_API_KEY;
    this.merchantId = process.env.JUSPAY_MERCHANT_ID;
    this.juspayBaseUrl = process.env.JUSPAY_BASE_URL;
    this.version = process.env.JUSPAY_API_VERSION;
  }

  public apiCalling = async (params: Object | String, flag?: JuspayFlagEnums): Promise<any> => {
    try {
      const config = {
        headers: {
          "x-merchantid": this.merchantId,
          Authorization: this.apiKey,
          version: this.version
        },
      };
      if (flag === JuspayFlagEnums.ORDER_STATUS) {
        console.log(`${this.juspayBaseUrl}/orders/${params}`)
        const result = await axios.get(`${this.juspayBaseUrl}/orders/${params}`, config);
        return result.data;
      }
      const result = await axios.post(`${this.juspayBaseUrl}/session`, params, config);
      return result.data;
    } catch (err) {
      throw new Error(err);
    }
  };
}
