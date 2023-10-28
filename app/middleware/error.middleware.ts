import { NextFunction, Request, Response } from "express";
import { HttpException } from "../library/HttpException/HttpException";
// import logger from '@logging/winstonLogger';

const errorMiddleware = (err: HttpException, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpException) {
    try {
      const status: number = err.status || 500;
      const error: string = err.message || "Something went wrong";
      console.log(err.message);
      // logger.error(`[${req.method}] ${req.path} >> StatusCode:: ${status}, Message:: ${error}`);
      res.status(status).json({ error });
    } catch (error) {
      next(error);
    }
  } else {
    next(err);
  }
};

export default errorMiddleware;
