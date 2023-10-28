import { redisClient } from "@/connections/redis/redis";
import { StatusCodeEnums, messagesEnglish, miscellaneous } from "@/enums/commonEnum/commonEnum";
import { HttpException } from "@/library/HttpException/HttpException";
import { Request } from "express";
import { crypt } from "hybrid-crypto-js";
import writeXlsxFile from "write-excel-file";
import nodemailer from "nodemailer";
import AWS from "aws-sdk";
import defaultResponseInterface from "@/interfaces/defaultResponse/defaultResponseInterface";
import { FileResponse } from "@/interfaces/fileResponse/fileResponse";

export const s3 = new AWS.S3();
const mail_transporter = {
  service: process.env.SMTP_SERVICES || "gmail",
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  auth: {
    user: "login@sportsbuzz11.com",
    pass: "xsmtpsib-e9b5dde072a2bbe3be5b5be51e93b6f4065df47f9182dd3090fbcd58e68b2945-XHd0SCgEcVrL7afx",
  },
  secure: false,
};
const transporter = nodemailer.createTransport(mail_transporter);
const imageFormat = [
  { extension: "jpeg", type: "image/jpeg" },
  { extension: "jpg", type: "image/jpeg" },
  { extension: "png", type: "image/png" },
  { extension: "gif", type: "image/gif" },
  { extension: "svg", type: "image/svg+xml" },
  { extension: "heic", type: "image/heic" },
  { extension: "heif", type: "image/heif" },
];

export function convertToDecimal(nAmount: number, length: number = 2): number {
  return Number(parseFloat(`${nAmount}`).toFixed(length));
}

export const getAWSsignedUrl = async (sFileName, sContentType, path) => {
  try {
    if (!sFileName) return {};
    sFileName = sFileName.replace("/", "-");
    sFileName = sFileName.replace(/\s/gi, "-");

    let fileKey = "";
    const s3Path = path;

    fileKey = `${Date.now()}_${sFileName}`;

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: s3Path + fileKey,
      Expires: 300,
      ContentType: sContentType,
    };

    await s3.getSignedUrl("putObject", params, function (error, url) {
      if (error) {
        throw error;
      } else {
        return { sUrl: url, sPath: s3Path + fileKey };
      }
    });
  } catch (error) {
    throw error;
  }
};

export const checkValidImageType = (sFileName, sContentType) => {
  const extension = sFileName.split(".").pop().toLowerCase();
  const valid = imageFormat.find((format) => format.extension === extension && format.type === sContentType);
  return !!valid;
};

export const pick = (object, keys) => {
  return keys.reduce((obj, key) => {
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key];
    }
    return obj;
  }, {});
};

export function randomIdgenerator(length: number): string {
  let key = "";
  const characters = miscellaneous.characters;

  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    key += characters[Math.floor(Math.random() * charactersLength)];
  }

  return key;
}

export function decryption(password): string {
  const decrypted = crypt.decrypt(process.env.PRIVATE_KEY, password);
  const decryptedData = decrypted.message;
  return decryptedData.toString();
}

export function projectionFields(body: any): any {
  const projection = {};
  for (var propName in body) {
    if (body[propName] !== null && body[propName] !== undefined) {
      projection[propName] = 1;
    }
  }
  return projection;
}

export function encryption(field: string): string {
  const encrypted = crypt.encrypt(process.env.PUBLIC_KEY, field);
  return encrypted.toString();
}

export function defaultSearch(val) {
  let search;
  if (val) {
    search = val
      .replace(/\\/g, "\\\\")
      .replace(/\$/g, "\\$")
      .replace(/\*/g, "\\*")
      .replace(/\+/g, "\\+")
      .replace(/\[/g, "\\[")
      .replace(/\]/g, "\\]")
      .replace(/\)/g, "\\)")
      .replace(/\(/g, "\\(")
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"');
    return search;
  } else {
    return "";
  }
}

export function searchValues(search: any): any {
  let userQuery;
  search = defaultSearch(search);
  if (isNaN(Number(search))) {
    userQuery = {
      $or: [
        { sName: { $regex: new RegExp("^.*" + search + ".*", "i") } },
        { sUsername: { $regex: new RegExp("^.*" + search + ".*", "i") } },
      ],
    };
  } else {
    userQuery = {
      $or: [{ sMobNum: { $regex: new RegExp("^.*" + search + ".*", "i") } }],
    };
  }
  return userQuery;
}

export function getIp(req: Request) {
  try {
    let ip: string | string[] = req.header("x-forwarded-for") ? req.header("x-forwarded-for").split(",") : [];
    ip = ip[0] || req.socket.remoteAddress;
    return ip;
  } catch (error) {
    return req.socket.remoteAddress;
  }
}

export const createXlsxFile = async (schema, objects, sFileName) : Promise<FileResponse> => {
  try {
    const data = await writeXlsxFile(objects, {
      schema,
    });

    return {
      filename: `${sFileName}.xlsx`,
      content: data,
    };
  } catch (err) {
    throw new HttpException(err.status, err.message);
  }
};

export function queuePush(queueName, data) {
  return redisClient.rpush(queueName, JSON.stringify(data));
}

export function queuePop(queueName, data) {
  return redisClient.lpop(queueName);
}

export function bulkQueuePop(queueName, limit) {
  return redisClient.lpop(queueName, limit);
}

export const bulkQueuePush = async (queueName, aData, limit) => {
  const aStringData = aData.map((d) => JSON.stringify(d));

  while (aStringData.length) {
    await redisClient.rpush(queueName, ...aStringData.splice(0, limit));
  }
};

export function queueLen(queueName) {
  return redisClient.llen(queueName);
}

async function validateEmail(email) {
  const sRegexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return email ? !!email.match(sRegexEmail) : false;
}

export const sendMailTo = async ({ oOptions, oAttachments }) => {
  try {
    const nodeMailerOptions = {
      from: oOptions.from,
      to: oOptions.to,
      subject: oOptions.subject,
      attachments: oAttachments,
    };

    const bEmail = await validateEmail(process.env.RECEIVER_EMAIL);
    if (process.env.RECEIVER_EMAIL && bEmail) {
      return await transporter.sendMail(nodeMailerOptions);
    }
    return;
  } catch (error) {
    throw new HttpException(error.status, error.message);
  }
};

export const getPaginationValues = (obj) => {
  let { start = 0, limit = 10, sort = "dCreatedAt", order, search } = obj;

  const orderBy = order && order === "asc" ? 1 : -1;

  const sorting = { [sort]: orderBy };

  if (search) search = defaultSearch(search);

  return { start, limit, sorting, search };
};

export const dateFormat = (date, locales = "en-US", timeZone = "Asia/Kolkata") =>
  new Date(date).toLocaleString(locales, {
    timeZone,
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
//Use SB-UUID4

export const getSignedUrl = async (payload): Promise<defaultResponseInterface> => {
  try {
    const { sFileName, sContentType } = payload;

    const valid = checkValidImageType(sFileName, sContentType);
    if (!valid)
      throw new HttpException(
        StatusCodeEnums.BAD_REQUEST,
        messagesEnglish.invalid.replace("##", messagesEnglish.image),
      );

    const data = await getAWSsignedUrl(sFileName, sContentType, process.env.S3_PAYMENT_PATH);
    return { status: StatusCodeEnums.OK, message: messagesEnglish.presigned_succ, data };
  } catch (error) {
    throw error;
  }

  
};
