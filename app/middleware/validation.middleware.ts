import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";
import { RequestHandler } from "express";
import { HttpException } from "../library/HttpException/HttpException";

const validationMiddleware = (
  type: any,
  value: string | "body" | "query" | "params" = "body",
  skipMissingProperties = false,
  whitelist = true,
  forbidNonWhitelisted = true,
): RequestHandler => {
  return (req, res, next) => {
    validate(plainToInstance(type, req[value]), { skipMissingProperties, whitelist, forbidNonWhitelisted }).then(
      (errors: ValidationError[]) => {
        if (errors.length > 0) {
          const message = errors
            .map((error: ValidationError) => {
              if (error.constraints) {
                return Object.values(error.constraints);
              }
              return Object.values(["Payload not according to the DTO in nexted object"]);
            })
            .join(", ");
          next(new HttpException(400, message));
        } else {
          next();
        }
      },
    );
  };
};

export default validationMiddleware;
