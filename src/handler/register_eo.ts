import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from 'model/user';
import EventOrganizer from 'model/event_organizer';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'pkg/http';
import CONSTANT from 'entity/const';
import { IRegisterEventOrganizerRequest, IRegisterEventOrganizerResponse } from 'entity/register_eo';
import { Logger } from 'pkg/logger';
import Joi from 'joi';

const validationSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9!@#$&*]{8,30}$')).required(),
    establishYear: Joi.number().required(),
    contactNumber: Joi.string().required(),
    industry: Joi.string().required(),
    address: Joi.string().required(),
    description: Joi.string().required(),
});

export const register = async (req: Request, res: Response) => {
	let registerReq: IRegisterEventOrganizerRequest | null = null;
	let registerRes: IRegisterEventOrganizerResponse | null = null;

    try {
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
        }

        registerReq = req.body
        registerReq.email = registerReq.email.toLowerCase();

        const existingUser = await User.findOne({ email: registerReq.email });
        if (existingUser) {
            if (existingUser.email === registerReq.email) {
                return sendResponse(res, StatusCodes.BAD_REQUEST, "Email already exists", "");
            } else {
                return sendResponse(res, StatusCodes.BAD_REQUEST, "Username already exists", "");
            }
        }

        registerReq.password = await bcrypt.hash(registerReq.password, 10);

        const newUser = await User.create({
            name: registerReq.name,
            email: registerReq.email,
            password:  registerReq.password,
            role: "eo",
            isActive: true,
        });

        const payload = {
            userId: newUser._id,
            role: newUser.role
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: process.env.JWT_EXPIRES_IN || CONSTANT.DEFAULT_JWT_EXPIRES_IN });

        const newOrganizer = await EventOrganizer.create({
            userId: newUser._id,
            establishYear: registerReq.establishYear,
            description: registerReq.description,
            address: registerReq.address,
            industry: registerReq.industry,
            contactNumber: registerReq.contactNumber,
        });
        
        registerRes = {
            userId: newUser._id,    
            name: newUser.name,
            email: newUser.email,
            token,
            isActive: newUser.isActive,
            role: newUser.role,
            establishYear: newOrganizer.establishYear,
            contactNumber: newOrganizer.contactNumber,
            industry: newOrganizer.industry,
            address: newOrganizer.address,
            description: newOrganizer.description,
            createdAt: newUser.createdAt.toISOString(),
            updatedAt: newUser.updatedAt?.toISOString(),
        };
 
        sendResponse(res, StatusCodes.OK, "EO registered successfully", registerRes);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to register a new EO",
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
