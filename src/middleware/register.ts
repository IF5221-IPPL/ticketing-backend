import { Request, Response, NextFunction } from 'express';
import { IRegisterRequest } from "entity/register/";
import { sendResponse } from 'pkg/http';
import { StatusCodes } from 'http-status-codes';

export const validateRegisterRequest = (req: Request, res: Response, next: NextFunction) => {

    let registerReq : IRegisterRequest = req.body;

    if (!registerReq.email || !registerReq.password || !registerReq.name || !registerReq.role) {
        return sendResponse(res, StatusCodes.BAD_REQUEST, "Missing required fields", "");
    }

    if (!isUserRoleValid(registerReq.role)) {
        return sendResponse(res, StatusCodes.BAD_REQUEST, "Invalid role", "");
    }

    next();
}

function isUserRoleValid(role: string) {
    return role === 'admin' || role === 'eo' || role === 'customer';
}