import { IsString } from "class-validator";

export class payoutCancelRequestDto {
  @IsString()
  public iWithdrawId: string;
}
