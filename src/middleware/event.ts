import { Request, Response, NextFunction } from "express";
import { isValidObjectId } from "mongoose";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";

const categorySchema = Joi.object({
  categoryName: Joi.string().required(),
  totalTickets: Joi.number().positive().required(),
  pricePerTicket: Joi.number().positive().required(),
});

const promotionalContentSchema = Joi.object({
  posterImageUrl: Joi.string().uri().allow(''),
  tags: Joi.array().items(Joi.string()),
  description: Joi.string().required(),
});

const eventSchema = Joi.object({
  eventTitle: Joi.string().trim().required(),
  subTitle: Joi.string().trim(),
  startDate: Joi.date().min("now").required(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  location: Joi.string().required(),
  categories: Joi.array().items(categorySchema).required(),
  promotionalContent: promotionalContentSchema,
});

const updateEventSchema = Joi.object({
  startDate: Joi.date().min("now").required(),
  subTitle: Joi.string().trim(),
  endDate: Joi.date().greater(Joi.ref("startDate")).required(),
  location: Joi.string().required(),
  categories: Joi.array().items(categorySchema).required(),
  promotionalContent: promotionalContentSchema,
}).or(
  "eventTitle",
  "startDate",
  "endDate",
  "location",
  "categories",
  "promotionalContent"
);

export const validateEventData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = eventSchema.validate(req.body);
  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }
  next();
};

export const validateEventId = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isValidObjectId(req.params.eventId)) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, "Invalid event ID", null);
  }
  next();
};

export const validateEventUpdateData = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = updateEventSchema.validate(req.body);
  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }
  next();
};
