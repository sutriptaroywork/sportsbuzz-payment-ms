export default interface verifyAppPaymentInterface {
  orderId: string;
  orderAmount: number;
  referenceId: string;
  txStatus: string;
  paymentMode: string;
  txMsg: string;
  txTime: string;
  signature: string;
}
