import { StatisticsDBConnect } from "@/connections/database/mongodb/mongodb";
import { adminPayEnums } from "@/enums/adminPayEnums/adminPayEnums";
import { credentialAttributes } from "@/interfaces/credential/credentialAttributes";
import { Schema } from "mongoose";
import bcrypt from "bcryptjs";
export interface CredentialModelInput extends Omit<credentialAttributes, "_id" | "createdAt" | "updatedAt"> {}
export interface CredentialModelOutput extends Required<credentialAttributes> {}

const saltRounds = 1
const salt = bcrypt.genSaltSync(saltRounds)

const Credential = new Schema<credentialAttributes>(
  {
    eKey: { type: String, enum: adminPayEnums, default: adminPayEnums.PAY, unique: true },
    sPassword: { type: String, trim: true, required: true },
    sExternalId: { type: String },
  },
  { timestamps: { createdAt: "dCreatedAt", updatedAt: "dUpdatedAt" } },
);

Credential.index({ eKey: 1 });

const CredentialModel = StatisticsDBConnect.model("credentials", Credential);

Credential.pre("save", function (next) {
  var admin = this;

  if (admin.isModified("sPassword")) {
    admin.sPassword = bcrypt.hashSync(admin.sPassword, salt);
  }
  next();
});

export default CredentialModel;
