import publishTransaction from "@/connections/rabbitmq/queue/transactionLogQueue";
import { redisClient } from "@/connections/redis/redis";
import { cashfreePathEnums } from "@/enums/cashfreePathEnums/cashfreePathEnums";
import { StatusCodeEnums } from "@/enums/commonEnum/commonEnum";
import { logTypeEnums } from "@/enums/logTypeTnums/logTypeEnums";
import { paymentGatewayEnums } from "@/enums/paymentGatewayEnums/PaymentGatewayEnums";
import { PlatformTypesEnums } from "@/enums/platformTypesEnums/platformTypesEnums";
import cashfreePaymentResponse, { cashfreePaymentReturnInterface } from "@/interfaces/cashfreePayment/cashfreePayment";
import cashfreePaymentPayload from "@/interfaces/cashfreePayment/cashfreePaymentPayload";
import checkCashfreeStatusResponseInterface from "@/interfaces/checkCashfreeStatus/checkCashfreeStatus";
import bankDao from "@/src/daos/bank/bankDao";
import cityDao from "@/src/daos/city/cityDao";
import stateDao from "@/src/daos/state/stateDao";
import { Crypt } from "hybrid-crypto-js";
import axios from "axios";
import qs from "qs";

export default class CashfreeCommonService {
  private bankDao: bankDao;
  private cityDao: cityDao;
  private stateDao: stateDao;
  
  constructor() {
    this.bankDao = new bankDao();
    this.cityDao = new cityDao();
    this.stateDao = new stateDao();
  }

  public checkCashfreeStatus = async (iOrderId: string): Promise<checkCashfreeStatusResponseInterface> => {
    try {
      const response = await axios.get(`${process.env.CASHFREE_STABLE_URL}/orders/${iOrderId}/payments`, {
        headers: {
          "x-api-version": cashfreePathEnums.X_API_VERSION,
          "Content-Type": "application/json",
          "x-client-id": process.env.CASHFREE_APPID,
          "x-client-secret": process.env.CASHFREE_SECRETKEY,
        },
      });

      console.log('response',response)
      const payload = response.data;

      const logData = {
        iOrderId,
        eGateway: paymentGatewayEnums.CASHFREE,
        eType: logTypeEnums.DEPOSIT,
        oReq: { iOrderId },
        oRes: response ? response.data : {},
      };
      //TODO : implement logs
      await publishTransaction(logData);
      //apiLogServices.saveTransactionLog(logData);

      return { isSuccess: true, payload };
    } catch (error) {
      return { isSuccess: false, error };
    }
  };

  public checkCashfreePayoutStatus = async (
    iTransferId: number
  ): Promise<{ isSuccess: boolean; payload?: any; error?: any }> => {
    try {
      const data = await this.validateCashfreeToken();
      const { isVerify, Token } = data;
      if (isVerify) {
        const response = await axios.get(
          `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_TRANSFER_STATUS_PATH}?transferId=${iTransferId}`,
          { headers: { "Content-Type": "application/json", Authorization: `Bearer ${Token}` } },
        );

        const payload = response.data;

        const logData = {
          iWithdrawId: iTransferId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
          oReq: { iTransferId },
          oRes: response ? response.data : {},
        };
        publishTransaction(logData);
        //apiLogServices.saveTransactionLog(logData);

        if (payload.status !== "ERROR") {
          return { isSuccess: true, payload: payload.data };
        } else return { isSuccess: false, error: payload };
      } else {
        return { isSuccess: false, error: data };
      }
    } catch (error) {
      return { isSuccess: false, error: error };
    }
  };

  public validateCashfreeToken = async () => {
    try {
      let existToken = await redisClient.get("CashfreePayoutToken");
      if (!existToken) {
        const response = await axios.post(
          `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_AUTHORIZE_PATH}`,
          {},
          {
            headers: {
              "X-Client-Id": process.env.CASHFREE_CLIENTID,
              "X-Client-Secret": process.env.CASHFREE_SECRETKEY,
            },
          },
        );

        console.log("response :", response.data);
        if (response.data.subCode === "200") {
          existToken = response.data.data.token;
          await redisClient.setex("CashfreePayoutToken", 300, existToken);
        }
        const error = { isVerify: false, ...response.data };
        if (response.data.subCode === "403" && response.data.message === "IP not whitelisted") {
          return error;
        }
      }
      const getVerifyFirst = await axios.post(
        `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_VERIFY_PATH}`,
        {},
        { headers: { Authorization: `Bearer ${existToken}` } },
      );

      console.log("get verify first :", getVerifyFirst.data);

      // const logData = { iUserId, iWithdrawId, iPassbookId, eGateway: 'CASHFREE', eType: 'W', oRes: getVerifyFirst ? getVerifyFirst.data : {} }
      // publishTransaction(logData) // not being used
      if (getVerifyFirst.data.subCode === "200") {
        return { isVerify: true, Token: existToken };
      }
    } catch (error) {
      console.error("cashfree token error: ", error);
      return { success: false, ...error };
    }
  };

  public cashFreePayment = async (
    payload: cashfreePaymentPayload,
    ePlatform: PlatformTypesEnums,
  ): Promise<cashfreePaymentReturnInterface> => {
    try {
      if ([PlatformTypesEnums.ANDROID, PlatformTypesEnums.IOS, PlatformTypesEnums.WEB].includes(ePlatform)) {
        try {
          let { data }: { data: cashfreePaymentResponse } = await axios.post(
            `${process.env.CASHFREE_STABLE_URL}/orders`,
            JSON.stringify(payload),
            {
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-client-id": process.env.CASHFREE_APPID,
                "x-client-secret": process.env.CASHFREE_SECRETKEY,
                "x-api-version": cashfreePathEnums.X_API_VERSION,
              },
            },
          );
          return { result: data || null };
        } catch (err) {
          throw err;
        }
      } else {
        payload.appId = process.env.CASHFREE_APPID;
        payload.secretKey = process.env.CASHFREE_SECRETKEY;
        const { data }: { data: cashfreePaymentResponse } = await axios.post(
          `${process.env.CASHFREE_URL}/links`,
          qs.stringify(payload),
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              "x-client-id": payload.appId,
              "x-client-secret": payload.secretKey,
              "x-api-version": cashfreePathEnums.X_API_VERSION,
            },
          },
        );
        return { result: data };
      }
    } catch (err) {
      throw err;
    }
  };

  public handleCashfreeError = (response: any) => {
    const { data } = response;
    const { subCode, message, status } = data;
    if (subCode === StatusCodeEnums.OK) {
      return { success: true };
    }
    return { success: false, status: subCode, message, sCurrentStatus: status };
  };

  public getUserBalance = async (
    iUserId: string,
    iWithdrawId: number,
    isVerify: boolean,
    Token: string,
  ): Promise<{ success: boolean; message: string; error?: any; status?: StatusCodeEnums | string}> => {
    try {
      //const { isVerify, Token } = await this.validateCashfreeToken();
      if (isVerify) {
        const response = await axios.get(
          `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_GETBALANCE_PATH}`,
          {
            headers: { Authorization: `Bearer ${Token}` },
          },
        );

        console.log("cashfree response :", response);
        const logData = {
          iUserId,
          iWithdrawId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
        };
        publishTransaction(logData);
        //apiLogServices.saveTransactionLog(logData) TODO : implement this with logs microservice

        const { success, status, message } = await this.handleCashfreeError(response);
        if (!success) {
          return { success, status, message };
        } else {
          return { success: true, message };
        }
      }
      console.log("failed");
      return { success: false, message: "failed" };
    } catch (error) {
      throw error;
    }
  };

  public getBenficiaryDetails = async (
    iUserId: string,
    isVerify: boolean,
    Token: string,
    iWithdrawId?,
    iPassbookId?,
  ): Promise<{ success: boolean; status?: string; message?: string }> => {
    try {
      //const { isVerify, Token } = await this.validateCashfreeToken();
      if (isVerify) {
        const response = await axios.get(
          `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_GETBENEFICIARY_PATH}/${iUserId}`,
          { headers: { Authorization: `Bearer ${Token}` } },
        );

        console.log("beneficiary details :", response.data);
        const logData = {
          iUserId,
          iWithdrawId,
          iPassbookId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
          oRes: response ? response.data : {},
        };
        await publishTransaction(logData);
        //apiLogServices.saveTransactionLog(logData)

        const { success, status, message } = await this.handleCashfreeError(response);
        if (!success && status !== StatusCodeEnums.NOT_FOUND) {
          return { success, status, message };
        } else if (!success && status === StatusCodeEnums.NOT_FOUND) {
          return await this.addBeneficiary(iUserId, iWithdrawId, iPassbookId, isVerify, Token);
        } else {
          return { success: true };
        }
      }
    } catch (error) {
      return { success: false, ...error };
    }
  };

  public addBeneficiary = async (
    iUserId: string,
    iWithdrawId: number,
    iPassbookId: number,
    isVerify: boolean,
    Token: string,
  ): Promise<{ success: boolean; status?: string; message?: string }> => {
    try {

      // const { isVerify, Token } = await this.validateCashfreeToken();
      if (isVerify) {
        const bankDetails = await this.bankDao.bankModelPopulate({ iUserId });

        let {
          sBranchName: address1,
          sAccountHolderName: name,
          sAccountNo: bankAccount,
          sIFSC: ifsc,
          iUserId: user,
        } = bankDetails;
        let {
          _id: beneId,
          sEmail: email,
          sMobNum: phone,
          iStateId: state = "Gujarat",
          iCityId: city = "Ahmedabad",
          nPinCode: pincode = 350005,
        } = user;
        email = email ? email : process.env.CASHFREE_MAIL_DEFAULT_ACCOUNT;

        if (typeof state === "number") {
          const stateData = await this.stateDao.findOneAndLean({ id: state }, { sName: 1 });
          state = stateData.sName.replace(/[^A-Za-z]/gi, "");
        }
        if (typeof city === "number") {
          const cityData = await this.cityDao.findOneAndLean({ id: city }, { sName: 1 });
          city = cityData.sName.replace(/[^A-Za-z]/gi, "");
        }
        bankAccount = this.decryption(bankAccount);
        const benData = JSON.stringify({
          beneId,
          name,
          email,
          phone,
          bankAccount,
          ifsc,
          address1,
          city,
          state,
          pincode,
        });

        const response = await axios.post(
          `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_ADDBENEFICIARY_PATH}`,
          benData,
          { headers: { Authorization: `Bearer ${Token}` } },
        );

        const logData = {
          iUserId,
          iWithdrawId,
          iPassbookId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
          oReq: JSON.parse(benData),
          oRes: response ? response.data : {},
        };
        await publishTransaction(logData);
        // apiLogServices.saveTransactionLog(logData) TODO: implement this when log microservice is ready

        const { success, status, message } = await this.handleCashfreeError(response);
        if (!success) {
          if (status === StatusCodeEnums.CONFLICT && message === "Entered bank Account is already registered") {
            const { success, status, message, beneId } = await this.getBeneficiaryId(
              bankAccount,
              ifsc,
              iWithdrawId,
              iPassbookId,
              isVerify,
              Token,
            );
            if (success) {
              await this.removeBeneficiary(beneId, iWithdrawId, iPassbookId, isVerify, Token);
              return await this.addBeneficiary(iUserId, iWithdrawId, iPassbookId, isVerify, Token);
            } else {
              const err = { success, status, message };
              return err;
            }
          } else {
            const err = { success, status, message };
            return err;
          }
        } else {
          return { success: true };
        }
      }
    } catch (error) {
      return { success: false, ...error };
    }
  };

  private decryption = (password) => {
    const crypt = new Crypt()
    const decrypted = crypt.decrypt(process.env.PRIVATE_KEY, password);
    const decryptedData = decrypted.message;
    return decryptedData.toString();
  };

  public getBeneficiaryId = async (
    bankAccount: string,
    ifsc: string,
    iWithdrawId: number,
    iPassbookId: number,
    isVerify: boolean,
    Token: string,
  ) => {
    try {
      //const { isVerify, Token } = await this.validateCashfreeToken();
      if (isVerify) {
        const response = await axios.get(
          `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_GETBENEFICIARYID_PATH}?bankAccount=${bankAccount}&ifsc=${ifsc}`,
          { headers: { Authorization: `Bearer ${Token}` } },
        );
        const logData = {
          iWithdrawId,
          iPassbookId,
          eGateway: paymentGatewayEnums.CASHFREE,
          eType: logTypeEnums.WITHDRAW,
          oReq: { bankAccount, ifsc },
          oRes: response ? response.data : {},
        };
        publishTransaction(logData);
        //apiLogServices.saveTransactionLog(logData)

        const { success, status, message } = await this.handleCashfreeError(response);
        if (success) {
          return { success: true, beneId: response.data.data.beneId };
        } else {
          return { success, status, message };
        }
      }
    } catch (error) {
      return { success: false, ...error };
    }
  };

  public removeBeneficiary = async (
    iUserId: string,
    iWithdrawId: number,
    iPassbookId: number,
    isVerify: boolean,
    Token: string,
  ) => {
    try {
      //const { isVerify, Token } = await this.validateCashfreeToken();
      if (isVerify) {
        const benData = JSON.stringify({ beneId: iUserId });
        await axios.post(
          `${process.env.CASHFREE_BASEURL}/${cashfreePathEnums.CASHFREE_REMOVEBENEFICIARY_PATH}`,
          benData,
          {
            headers: { Authorization: `Bearer ${Token}` },
          },
        );

        const logData = { iUserId, iWithdrawId, iPassbookId, eGateway: paymentGatewayEnums.CASHFREE, eType: "W" };
        publishTransaction(logData);
        //apiLogServices.saveTransactionLog(logData) TODO: implement this when log microservice is ready
        return { success: true };
      }
    } catch (error) {
      return { success: false, ...error };
    }
  };
}
