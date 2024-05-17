import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sendResponse } from 'pkg/http';
import { Logger } from 'pkg/logger';
import Joi from 'joi';
import Purchase from 'model/purchase/';

const validationSchema = Joi.object({
    userId: Joi.string().hex().length(24).required(),
});

export const getPurchases = async (req: Request, res: Response) => {
    let response = null;

    try {
        const { error } = validationSchema.validate(req.body);
        if (error) {
            return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
        }

        if (req.user._id.toString() !== req.body.userId) {
            return sendResponse(res, StatusCodes.FORBIDDEN, "You are not allowed", "");
        }

        const purchases = await Purchase.find({userId: req.body.userId});
        response = purchases
        
        sendResponse(res, StatusCodes.OK, "Successfully get subscription purchases", response);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to get subscription purchases",
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
