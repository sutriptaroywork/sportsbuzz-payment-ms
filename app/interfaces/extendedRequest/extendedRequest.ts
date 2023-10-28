import { Request } from "express";
import { UserModelAttributes } from "@/interfaces/user/userInterface";

export interface extendedRequest extends Request {
  userLanguage: string;
  user: UserModelAttributes;
}
