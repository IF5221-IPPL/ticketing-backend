import { Request, Response } from 'express';
import User from 'model/user';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'pkg/http';
import { IUpdateCustomerRequest, IUpdateCustomerResponse } from 'entity/update_customer';
import { Logger } from 'pkg/logger';
import Joi from 'joi';

const validationSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    profilePictureUrl: Joi.string().uri().optional(),
});


export const updateCustomer = async (req: Request, res: Response) => {
	let updateCustomerReq: IUpdateCustomerRequest | null = null;
	let updateCustomerRes: IUpdateCustomerResponse | null = null;

    try {
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
        }

        if (req.user._id.toString() !== req.body.userId) {
            return sendResponse(res, StatusCodes.FORBIDDEN, "You are not allowed", "");
        }

        updateCustomerReq = req.body
        updateCustomerReq.email = updateCustomerReq.email.toLowerCase();

        const updatedCustomer = await User.findByIdAndUpdate(updateCustomerReq.userId,
        {
            name: updateCustomerReq.name,
            email: updateCustomerReq.email,
            profilePictureUrl: updateCustomerReq.profilePictureUrl
        },
        {
            new: true,
            runValidators: true,
        });

        updateCustomerRes = {
            userId: updatedCustomer._id,    
            name: updatedCustomer.name,
            email: updatedCustomer.email,
            isActive: updatedCustomer.isActive,
            role: updatedCustomer.role,
            profilePictureUrl: updatedCustomer.profilePictureUrl,
            createdAt: updatedCustomer.createdAt.toISOString(),
            updatedAt: updatedCustomer.updatedAt?.toISOString(),
        };

        sendResponse(res, StatusCodes.OK, "Customer updated successfully", updateCustomerRes);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to update customer",
				request: updateCustomerReq,
				response: updateCustomerRes,
				error: { 
					message: err.message, 
					stack: err.stack 
				},
			}
		)
        sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
    }
};
