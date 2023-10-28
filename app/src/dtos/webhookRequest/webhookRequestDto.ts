import { IsObject, IsString } from "class-validator";

export class webhookRequestDto {
  @IsString()
  public id: string;

  @IsString()
  public date_created: string;

  @IsString()
  public event_name: string;

  @IsObject()
  public content: any;
}
