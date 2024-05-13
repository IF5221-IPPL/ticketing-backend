import { Request, Response } from "express";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import CONSTANT from "entity/const/";
import EventOrganizer from "model/event_organizer/";
import User from "model/user/";

export const viewAccounts = async (req: Request, res: Response) => {
  const {
    value: { page, limit },
    error,
  } = paginationSchema.validate(req.query);

  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }

  try {
    const totalUsers = await User.countDocuments();

    const totalPages = Math.ceil(totalUsers / limit);
    //Prevent sending multiple responses
    if (handlePaginationError(res, page, totalPages)) {
      return;
    }
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit).lean();

    sendResponse(res, StatusCodes.OK, "Accounts retrieved successfully", {
      accounts: users,
      totalAccounts: totalUsers,
      currentPage: parseInt(page, 10),
      totalPages: totalPages,
    });
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

export const deleteAccount = async (req: Request, res: Response) => {
  const accountId = req.params.accountId;

  try {
     const deletedEvent = await User.findByIdAndDelete(accountId);

    if (!deletedEvent) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        `Account with id ${accountId} not found`,
        null
      );
    }
    return sendResponse(
      res,
      StatusCodes.NO_CONTENT,
      `Account with title ${accountId} deleted successfully`,
      null
    );
  } catch (error) {
    logError(req, res, "Error deleting event by id", error);
    return sendResponse(
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

const handlePaginationError = (
  res: Response,
  page: number,
  totalPages: number
) => {
  if (page > totalPages && totalPages != 0) {
    sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "Requested page exceeds the total number of pages, no events to show.",
      {
        events: [],
        totalEvents: 0,
        currentPage: page,
        totalPages,
      }
    );
    return true;
  }
  return false;
};

// input validation using Joi
const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
});
