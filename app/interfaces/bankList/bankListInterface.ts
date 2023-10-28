import { bankProviderEnums } from "@/enums/bankProvider/bankProviderEnums";

export default interface bankListModelInterface {
  sCode: string;
  sName: string;
  eProvider: bankProviderEnums;
}
