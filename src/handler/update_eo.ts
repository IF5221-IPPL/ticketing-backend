import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from 'model/user';
import EventOrganizer from 'model/event_organizer';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'pkg/http';
import CONSTANT from 'entity/const';
import { IUpdateEventOrganizerRequest, IUpdateEventOrganizerResponse } from 'entity/update_eo';
import { Logger } from 'pkg/logger';
import Joi from 'joi';

const validationSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    establishYear: Joi.number().required(),
    contactNumber: Joi.string().required(),
    industry: Joi.string().required(),
    address: Joi.string().required(),
    description: Joi.string().required(),
    profilePictureUrl: Joi.string().uri().optional(),
});

export const updateEO = async (req: Request, res: Response) => {
	let updateReq: IUpdateEventOrganizerRequest | null = null;
	let updateRes: IUpdateEventOrganizerResponse | null = null;

    try {
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
        }

        if (req.user._id.toString() !== req.body.userId) {
            return sendResponse(res, StatusCodes.FORBIDDEN, "You are not allowed", "");
        }

        updateReq = req.body
        updateReq.email = updateReq.email.toLowerCase();

        const updatedUser = await User.findByIdAndUpdate(updateReq.userId,
            {
                name: updateReq.name,
                email: updateReq.email,
                profilePictureUrl: updateReq.profilePictureUrl
            },
            {
                new: true,
                runValidators: true,
            });

        const updatedOrganizer = await EventOrganizer.findOneAndUpdate({userId: updateReq.userId},{
            userId: updatedUser._id,
            establishYear: updateReq.establishYear,
            description: updateReq.description,
            address: updateReq.address,
            industry: updateReq.industry,
            contactNumber: updateReq.contactNumber,
        },
        {
            new: true,
            runValidators: true,
        });
        
        updateRes = {
            userId: updatedUser._id,    
            name: updatedUser.name,
            email: updatedUser.email,
            isActive: updatedUser.isActive,
            role: updatedUser.role,
            establishYear: updatedOrganizer.establishYear,
            contactNumber: updatedOrganizer.contactNumber,
            industry: updatedOrganizer.industry,
            address: updatedOrganizer.address,
            description: updatedOrganizer.description,
            gptAccessTokenQuota: CONSTANT.DEFAULT_GPT_ACCESS_TOKEN_QUOTA,
            profilePictureUrl: updatedUser.profilePictureUrl,
            createdAt: updatedUser.createdAt.toISOString(),
            updatedAt: updatedUser.updatedAt?.toISOString(),
        };
 
        sendResponse(res, StatusCodes.OK, "EO updated successfully", updateRes);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to update EO",
				request: updateReq,
				response: updateRes,
				error: { 
					message: err.message, 
					stack: err.stack 
				},
			}
		)
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
    }
};
