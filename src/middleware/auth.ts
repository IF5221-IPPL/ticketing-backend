import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "pkg/http/";

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) {
        sendResponse(res, StatusCodes.FORBIDDEN, "Forbidden request", "");
      }
      res.locals.user = user;
      next();
    });
  } else {
    sendResponse(res, StatusCodes.UNAUTHORIZED, "You are not authorized", "");
  }
};
