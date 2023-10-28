import { IsString } from "class-validator";

export class checkPayoutStatusDto {
  @IsString()
  public iUserId: string;
}
