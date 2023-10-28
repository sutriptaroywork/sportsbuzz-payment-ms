import { responsePayload, responsePayloadUserDeposit } from "@/interfaces/responsePayload/responsePayload";

export class paymentResponseDto {
  public static toResponse = (responsePayload: responsePayload) => {
    const { status, message } = responsePayload;
    if (responsePayload.data) {
      return {
        status,
        message,
        data: responsePayload.data,
      };
    }
    return { status, message };
  };

  public static toResponseUserDeposit = (responsePayload: responsePayloadUserDeposit) => {
    const { status, message } = responsePayload;
    if (responsePayload.data) {
      return {
        status,
        message,
        data: responsePayload.data,
      };
    }
    return { status, message };
  };
}
