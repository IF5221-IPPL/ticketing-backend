import { Request, Response } from 'express';
import User from 'model/user';
import EventOrganizer from 'model/event_organizer';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'pkg/http';
import { IGetEventOrganizerResponse } from 'entity/get_eo';
import { Logger } from 'pkg/logger';
import Joi from 'joi';

const validationSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
});

export const getEO = async (req: Request, res: Response) => {
	let response: IGetEventOrganizerResponse | null = null;

    try {
        const { error } = validationSchema.validate(req.params);
        if (error) {
            return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
        }

        if (req.user._id.toString() !== req.params.userId) {
            return sendResponse(res, StatusCodes.FORBIDDEN, "You are not allowed", "");
        }

        const user = await User.findById(req.params.userId);
        if (!user) {
            return sendResponse(res, StatusCodes.NOT_FOUND, "User not found", "");
        }
        const organizer = await EventOrganizer.findOne({userId: req.params.userId});
        
        response = {
            userId: user._id,    
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            role: user.role,
            establishYear: organizer.establishYear,
            contactNumber: organizer.contactNumber,
            industry: organizer.industry,
            address: organizer.address,
            description: organizer.description,
            gptAccessTokenQuota: organizer.gptAccessTokenQuota,
            profilePictureUrl: user.profilePictureUrl,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt?.toISOString(),
        };
 
        sendResponse(res, StatusCodes.OK, "Successfully get EO", response);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to get EO",
				request: {userId: req.params.userId},
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
