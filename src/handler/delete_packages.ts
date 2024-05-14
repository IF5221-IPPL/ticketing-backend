import { Request, Response } from "express";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import { Logger } from "pkg/logger/";
import Package from "model/package/";

export const deletePackage = async (req: Request, res: Response) => {
    try {
        const packageId = req.params.packageId;

        await Package.deleteOne({ _id: packageId });

        return sendResponse(res, StatusCodes.OK, "Package deleted successfully", {
            _id: packageId,
        });
    } catch (err) {
        Logger.error(
			{
				message: "Failed to delete package",
                request: {
                    packageId: req.params.packageId,
                },
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