import { StatusCodeEnums } from "@/enums/commonEnum/commonEnum";

export default interface defaultResponseInterface {
  status: StatusCodeEnums;
  message: string;
  data?: any;
}
