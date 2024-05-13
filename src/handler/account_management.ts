import { Request, Response } from "express";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import User from "model/user/";
import CONSTANT from "entity/const/";
import { isValidObjectId } from "mongoose";
import { IAccount } from "entity/account/";

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
    const users: any = await User.find({ role: { $in: rolesToFind } })
      .skip(skip)
      .limit(limit);

    // Map each user to an IAccount object
    const results: IAccount[] = users.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
    sendResponse(res, StatusCodes.OK, "Accounts retrieved successfully", {
      accounts: results,
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
    // Map each user to an IAccount object
    const results: IAccount[] = users.map((user) => ({
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));

    sendResponse(
      res,
      StatusCodes.OK,
      "Filtered accounts retrieved successfully",
      {
        accounts: results,
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
  const accountId = req.params.accountId;

  if (!isValidObjectId(accountId)) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "Invalid account ID",
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

export const updateAccount = async (req: Request, res: Response) => {
  const accountId = req.params.accountId;
  if (!isValidObjectId(accountId)) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      "Invalid account ID",
      null
    );
  }

  const { value, error } = userSchema.validate(req.body);
  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }
  try {
    const updatedAccount = await User.findByIdAndUpdate(accountId, value, {
      new: true,
      runValidators: true,
    });
    const result: IAccount = {
        name: updatedAccount.name,
        email: updatedAccount.email,
        role: updatedAccount.role,
        isActive: updatedAccount.isActive,
        createdAt: updatedAccount.createdAt,
        updatedAt: updatedAccount.updatedAt,
      };

    return sendResponse(
      res,
      StatusCodes.OK,
      `Account with Id ${accountFilterSchema} successfully updated!`,
      result
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
const statusActiveSchema = Joi.object({
  isActive: Joi.bool().required(),
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

const userSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().optional(),
  isActive: Joi.boolean().optional(),
  createdAt: Joi.date().iso().optional(),
  updatedAt: Joi.date().iso().optional(),
});
