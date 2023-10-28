import { IsString } from "class-validator";

export class orderStatusRequestDto {
  @IsString()
  public id: string;
}
