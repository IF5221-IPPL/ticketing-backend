import { Request, Response, NextFunction } from 'express';
import { sendResponse } from 'pkg/http';
import { StatusCodes } from 'http-status-codes';
import { ILoginRequest } from 'entity/login/';

export const validateLoginRequest = (req: Request, res: Response, next: NextFunction) => {

    let registerReq : ILoginRequest = req.body;

    if (!registerReq.email || !registerReq.password) {
        return sendResponse(res, StatusCodes.BAD_REQUEST, "Missing required fields", "");
    }

    next();
}