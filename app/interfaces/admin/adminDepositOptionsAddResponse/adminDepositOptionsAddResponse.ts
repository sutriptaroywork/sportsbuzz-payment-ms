import { StatusCodeEnums } from "@/enums/commonEnum/commonEnum";
import { paymentOptionOutput } from "@/models/paymentOptionModel/paymentOptionModel";

export default interface adminDepositOptionAddResponse {
  status: StatusCodeEnums;
  message: string;
  data?: paymentOptionOutput;
}

export default interface adminDepositOptionGetResponse {
  status: StatusCodeEnums;
  message: string;
  data?: paymentOptionOutput;
}
