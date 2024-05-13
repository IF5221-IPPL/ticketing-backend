import { Request, Response } from "express";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import User from "model/user/";
import CONSTANT from "entity/const/";

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

    const rolesToFind = [CONSTANT.ROLE.EO, CONSTANT.ROLE.CUSTOMER];
    const users = await User.find({ role: { $in: rolesToFind } })
      .skip(skip)
      .limit(limit);

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

export const viewAccountsWithFiltered = async (req: Request, res: Response) => {
  const {
    value: { page, limit, status, keyword },
    error,
  } = accountFilterSchema.validate(req.query);
  let query: any = {};

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
    // Prevent sending multiple responses
    if (handlePaginationError(res, page, totalPages)) {
      return;
    }

    const skip = (page - 1) * limit;

    if (status) {
      query = { role: { $in: status.split(",") } };
    }

    if (keyword) {
      const keywordRegex = new RegExp(keyword, "i");
      query.$or = [{ name: keywordRegex }, { email: keywordRegex }];
    }

    const users = await User.find(query).skip(skip).limit(limit);

    sendResponse(
      res,
      StatusCodes.OK,
      "Filtered accounts retrieved successfully",
      {
        accounts: users,
        totalAccounts: totalUsers,
        currentPage: parseInt(page, 10),
        totalPages: totalPages,
      }
    );
  } catch (error) {
    logError(req, res, "Error fetching filtered accounts", error);
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const {
    value: { accountId },
    error,
  } = accountIdSchema.validate(req.params.accountId);

  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }

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

export const updateActiveStatusAccount = async (
  req: Request,
  res: Response
) => {
  const { value: accountId, error: accountIdError } = accountIdSchema.validate(
    req.params.accountId
  );
  if (accountIdError) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      accountIdError.details[0].message,
      null
    );
  }

  const { value: statusActive, error: statusActiveError } =
    statusActiveSchema.validate(req.params.statusActive);
  if (statusActiveError) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      statusActiveError.details[0].message,
      null
    );
  }
  try {
    const updatedEvent = await User.findByIdAndUpdate(accountId, statusActive, {
      new: true,
      runValidators: true,
    });

    return sendResponse(
      res,
      StatusCodes.OK,
      `Account with Id ${accountId} successfully updated!`,
      updatedEvent
    );
  } catch (error) {
    logError(req, res, "Error updating account", error);
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

const accountIdSchema = Joi.object({
  eventId: Joi.string().required(),
});

const statusActiveSchema = Joi.object({
  statusId: Joi.string().required(),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
});

const accountFilterSchema = Joi.object({
  status: Joi.string().trim().optional(),
  keyword: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
});
