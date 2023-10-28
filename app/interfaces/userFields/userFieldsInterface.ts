import { MatchModelOutput } from "@/models/matchModel/matchModel";
import { PassbookOutput } from "@/models/passbookModel/passbookModel";
import { UserDepositOutput } from "@/models/userDepositModel/userDepositModel";
import { UserModelOutput } from "@/models/userModel/userModel";
import { userWithdrawOutput } from "@/models/userWithdrawModel/userWithdrawModel";
import { Match } from "aws-sdk/clients/codeguruprofiler";

export interface UserFieldsDeposit extends UserDepositOutput, UserModelOutput {

}

export interface UserFieldsWithdraw extends userWithdrawOutput, UserModelOutput {

}

export interface UserFieldsInterface extends Omit<PassbookOutput, 'eStatus' | 'eType' | 'dMatchStartDate' | 'dActivityDate'> {

}

export interface UserFieldsPassbook extends UserFieldsInterface, UserModelOutput {
 sMatchName : string,
 dMatchStartDate : Date | string;
 dActivityDate: Date | string;
}