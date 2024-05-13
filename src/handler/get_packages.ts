import { Request, Response } from "express";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import { Logger } from "pkg/logger/";
import Package from "model/package/";

export const getPackages = async (req: Request, res: Response) => {
    try {
        const packages = await Package.find();

        return sendResponse(res, StatusCodes.OK, "Packages retrieved successfully", packages);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to retrieve packages",
				error: { 
					message: err.message, 
					stack: err.stack 
				},
			}
        );
        sendResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          null
        );
    }
}