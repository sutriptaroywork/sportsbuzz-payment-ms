import { paymentOptionEnums } from "@/enums/paymentOptionEnums/paymentOptionEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import { IsOptional, IsString } from "class-validator";

export class paymentRequestDto {
  @IsString()
  public nAmount: string;

  @IsString()
  public eType: paymentOptionEnums;

  @IsOptional()
  public sPromocode: string;

  @IsString()
  public iOrderId: string;

  @IsOptional()
  public lang: string;

  @IsOptional()
  public iUserId: string;

  @IsString()
  public ePlatform: PlatformTypesEnums;
}
