import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from 'model/user';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'pkg/http';
import CONSTANT from 'entity/const';
import { IChangePasswordRequest, IChangePasswordResponse } from 'entity/change_password';
import { Logger } from 'pkg/logger';
import Joi from 'joi';


const validationSchema = Joi.object({
    userId: Joi.string().required(),
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9!@#$&*]{8,30}$')).required(),
});

export const changePassword = async (req: Request, res: Response) => {
    let changePassReq: IChangePasswordRequest | null = null;
	let changePassRes: IChangePasswordResponse | null = null;

    try {
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
        }

        changePassReq = req.body

        if (req.user._id.toString() !== changePassReq.userId) {
            return sendResponse(res, StatusCodes.FORBIDDEN, "You are not allowed", "");
        }

        const user = await User.findById(changePassReq.userId);
        if (!user) {
            return sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid login credential", "");
        }

        const isPasswordMatch = await bcrypt.compare(changePassReq.oldPassword, user.password);
        if (!isPasswordMatch) {
            return sendResponse(res, StatusCodes.UNAUTHORIZED, "Invalid login credential", "");
        }

        changePassReq.newPassword = await bcrypt.hash(changePassReq.newPassword, 10);

        const updatedUser = await User.findOneAndUpdate({
            _id: changePassReq.userId
        }, {
            password: changePassReq.newPassword
        });

        changePassRes = {
            userId: updatedUser._id,    
            name: updatedUser.name,
            email: updatedUser.email,
            isActive: updatedUser.isActive,
            role: updatedUser.role,
            profilePictureUrl: updatedUser.profilePictureUrl,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt?.toISOString(),
        };

        sendResponse(res, StatusCodes.OK, "Password changed successfully", changePassRes);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to change the password",
				request: changePassReq,
				response: changePassRes,
				error: { 
					message: err.message, 
					stack: err.stack 
				},
			}
		)
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
    }
};