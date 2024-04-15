import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../model/user';
import { StatusCodes } from 'http-status-codes';
import { ILoginRequest, ILoginResponse } from '../entity/login';
import { sendResponse } from 'pkg/http';
import CONSTANT from 'entity/const';
import { Logger } from 'pkg/logger';
import Joi from 'joi';

const validationSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

export const login = async (req: Request, res: Response) => {
    let loginReq: ILoginRequest | null = null;
	let loginRes: ILoginResponse | null = null;

    try {
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
        }

        loginReq = req.body;
        loginReq.email = loginReq.email.toLowerCase();

        const user = await User.findOne({ email: loginReq.email });
        if (!user) {
            return sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid login credential", "");
        }

        const isPasswordMatch = await bcrypt.compare(loginReq.password, user.password);
        if (!isPasswordMatch) {
            return sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid login credential", "");
        }

        if (!user.isActive) {
            return sendResponse(res, StatusCodes.FORBIDDEN, "User is not active", "");
        }

        const payload = {
            userId: user._id,
            role: user.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN || CONSTANT.DEFAULT_JWT_EXPIRES_IN });

        loginRes = {
            userId: user._id,
            name: user.name,
            email: user.email,
            token,
            isActive: user.isActive,
            role: user.role,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        };

        sendResponse(res, StatusCodes.OK, "Login success", loginRes);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to login",
				request: loginReq,
				response: loginRes,
				error: { 
					message: err.message, 
					stack: err.stack 
				},
			}
		)
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
    }
};
