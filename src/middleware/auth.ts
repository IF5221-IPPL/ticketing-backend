import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "pkg/http/";
import User from '../model/user';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    let splittedHeader = authHeader.split(' ');
    if (splittedHeader.length !== 2) {
      return sendResponse(res, StatusCodes.UNAUTHORIZED, "You are not authorized", "");
    }

    try {
      const decoded = jwt.verify(splittedHeader[1], process.env.JWT_SECRET!);

      const user = await User.findOne({ _id: decoded.userId });

      if (!user) {
        return sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid login credential", "");
      }

      if (!user.isActive) {
        return sendResponse(res, StatusCodes.FORBIDDEN, "Forbidden request", "");
      }

      req.user = user;

      next();
    } catch (err) {
      sendResponse(res, StatusCodes.FORBIDDEN, "Forbidden request", "");
    }
  } else {
    sendResponse(res, StatusCodes.UNAUTHORIZED, "You are not authorized", "");
  }
};
