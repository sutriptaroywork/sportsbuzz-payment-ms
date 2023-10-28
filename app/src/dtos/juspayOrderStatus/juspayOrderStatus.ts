import { IsString } from "class-validator";

export class JuspayOrderStatusDto {
  @IsString()
  public id: string;
}