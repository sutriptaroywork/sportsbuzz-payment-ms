import { StatusCodeEnums, messagesEnglish } from "@/enums/commonEnum/commonEnum";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { JuspaySessionResponse } from "@/interfaces/juspaySessionResponse/JuspaySessionResponse";

// export juspaySdkPayloadInterface {
  
// }

export default class sessionResponseDto {

  public static toResponse = (data: JuspaySessionResponse ) => {
    return {
      payment_link: data.payment_links.web,
      sdk_payload: data.sdk_payload,
      gateway: paymentGatewayEnums.JUSPAY,
    };
  };
}
