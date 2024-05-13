import { Request, Response } from "express";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import CONSTANT from "entity/const/";
import EventOrganizer from "model/event_organizer/";
import User from "model/user/";


export const viewAccounts = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const totalUsers = await User.countDocuments();
        const totalEventOrganizers = await EventOrganizer.countDocuments();
        const totalAccounts = totalUsers + totalEventOrganizers;

        const totalPages = Math.ceil(totalAccounts / limit);
        const skip = (page - 1) * limit;

        const customers = await User.find().skip(skip).limit(limit).lean();
        const remainingLimit = Math.max(limit - customers.length, 0);
        const eventOrganizers = await EventOrganizer.find().skip(skip - totalUsers > 0 ? skip - totalUsers : 0).limit(remainingLimit).lean();

        const accounts = [...customers, ...eventOrganizers];

        sendResponse(
            res,
            StatusCodes.OK,
            "Accounts retrieved successfully",
            {
                accounts: accounts,
                totalAccounts: totalAccounts,
                currentPage: parseInt(page, 10),
                totalPages: totalPages
            }
        );
    } catch (error) {
        logError(req, res, "Error fetching accounts", error);
        sendResponse(
            res,
            StatusCodes.INTERNAL_SERVER_ERROR,
            "Internal Server Error",
            null
        );
    }
};


  
// Helper function for logging error
function logError(
    req: Request,
    res: Response,
    errorMessage: string,
    errorObject: any
  ) {
    Logger.error({
      message: errorMessage,
      request: {
        url: req.url,
        method: req.method,
        headers: req.headers,
        body: req.body,
      },
      response: {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
      },
      error: {
        message: errorObject.message,
        stack: errorObject.stack,
      },
    });
  }
  