import { IsOptional, IsString } from "class-validator";

export class depositRequestDto {
  @IsString()
  iUserId: string;

  @IsString()
  nAmount: string;

  @IsOptional()
  sPromocode?: string;
}
