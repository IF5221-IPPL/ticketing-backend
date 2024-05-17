import { Request, Response } from 'express';
import User from 'model/user';
import EventOrganizer from 'model/event_organizer';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'pkg/http';
import { IGetUserResponse } from 'entity/get_user';
import { Logger } from 'pkg/logger';
import Joi from 'joi';

const validationSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
});

export const getUser = async (req: Request, res: Response) => {
	let response: IGetUserResponse | null = null;

    try {
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
        }

        if (req.user._id.toString() !== req.body.userId) {
            return sendResponse(res, StatusCodes.FORBIDDEN, "You are not allowed", "");
        }

        const user = await User.findById(req.body.userId);
        if (!user) {
            return sendResponse(res, StatusCodes.NOT_FOUND, "User not found", "");
        }
        
        response = {
            userId: user._id,    
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            role: user.role,
            profilePictureUrl: user.profilePictureUrl,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt?.toISOString(),
        };
 
        sendResponse(res, StatusCodes.OK, "Successfully get user", response);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to get user",
				request: {userId: req.body.userId},
				response: response,
				error: { 
					message: err.message, 
					stack: err.stack 
				},
			}
		)
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
    }
};
