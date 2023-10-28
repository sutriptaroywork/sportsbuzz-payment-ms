import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import { oGST } from "../gst/calculateGSTResponse";

export default interface updateBalance {
  txStatus: string;
  orderId: string;
  deposit?: UserDepositOutput;
  referenceId: string;
  oGST: oGST;
}
