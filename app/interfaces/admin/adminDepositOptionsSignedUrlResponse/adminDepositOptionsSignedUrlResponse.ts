import { StatusCodeEnums } from "@/enums/commonEnum/commonEnum";
import signedUrlResponse from "@/interfaces/awsSignedUrlResponse/awsSignedUrlResponse";

export default interface adminDepositOptionsSignedUrlResponse {
  status: StatusCodeEnums;
  message: string;
  data: signedUrlResponse;
}
