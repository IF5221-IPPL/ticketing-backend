import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from 'model/user';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'pkg/http';
import CONSTANT from 'entity/const';
import { IRegisterRequest, IRegisterResponse } from 'entity/register';
import { Logger } from 'pkg/logger';

export const register = async (req: Request, res: Response) => {
	let registerReq: IRegisterRequest | null = null;
	let registerRes: IRegisterResponse | null = null;
    try {
       registerReq = req.body;

        const lowerCaseEmail = registerReq.email.toLowerCase();
        const lowerCaseUsername = registerReq.username.toLowerCase();

        const existingUser = await User.findOne({ $or: [{ email: lowerCaseEmail }, { username: lowerCaseUsername }] });
        if (existingUser) {
            if (existingUser.email === lowerCaseEmail) {
                return sendResponse(res, StatusCodes.BAD_REQUEST, "Email already exists", "");
            } else {
                return sendResponse(res, StatusCodes.BAD_REQUEST, "Username already exists", "");
            }
        }

        const hashedPassword = await bcrypt.hash(registerReq.password, 10);

        const newUser = await User.create({
            username: lowerCaseUsername,
            name: registerReq.name,
            email: lowerCaseEmail,
            password: hashedPassword,
            role: registerReq.role,
            isActive: true,
        });

        const payload = {
            userId: newUser.userId,
            username: newUser.username,
            role: newUser.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN || CONSTANT.JWT_EXPIRES_IN });

        registerRes = {
            username: newUser.username,
            name: newUser.name,
            email: newUser.email,
            token,
            isActive: newUser.isActive,
            role: newUser.role,
            createdAt: newUser.createdAt.toISOString(),
            updatedAt: newUser.updatedAt?.toISOString(),
        };

        sendResponse(res, StatusCodes.OK, "User registered successfully", registerRes);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to register a new user",
				request: registerReq,
				response: registerRes,
				error: { 
					message: err.message, 
					stack: err.stack 
				},
			}
		)
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
    }
};
