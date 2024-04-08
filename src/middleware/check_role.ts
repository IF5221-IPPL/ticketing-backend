import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "pkg/http/";

export const checkRole = (role: string) => { 
    return (req: Request, res: Response, next: NextFunction) => {
        if (req.user && req.user.role === role) {
            next();
        } else {
            sendResponse(res, StatusCodes.FORBIDDEN, "Forbidden request", "");
        }
    };
};