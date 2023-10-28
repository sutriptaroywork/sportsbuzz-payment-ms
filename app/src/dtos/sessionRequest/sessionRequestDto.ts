import { IsOptional, IsString } from "class-validator";
import { Double } from "mongodb";

export class sessionRequestDto {

  @IsString()
  public nAmount: Double;

  @IsOptional()
  public sPromocode: string;
}
