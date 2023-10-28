export interface settingsAttributes {
  sTitle: String;
  sKey: String;
  nMax: number;
  nMin: number;
  sLogo: String;
  nPosition: number;
  sImage: String;
  sDescription: String;
  sShortName: String;
  eStatus: String; // Y = Active, N = Inactive
  sExternalId: String;
  sValue: String;
  createdAt?: Date;
  updatedAt?: Date;
}
