import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import { sendResponse } from 'pkg/http/';
import { StatusCodes } from "http-status-codes";
import Joi from 'joi';

// Define the schema for event validation
const eventSchema = Joi.object({
  name: Joi.string().trim().required(),
  description: Joi.string().trim().required(),
  ticketPrice: Joi.number().positive().required(),
  startDate: Joi.date().min('now').required(),
  endDate: Joi.date().greater(Joi.ref('startDate')).required(),
  maxTicketCount: Joi.number().positive().required()
});

export const validateEventData = (req: Request, res: Response, next: NextFunction) => {
  const { error } = eventSchema.validate(req.body);
  if (error) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, null);
  }
  next();
};

export const validateEventId = (req: Request, res: Response, next: NextFunction) => {
  if (!isValidObjectId(req.params.eventId)) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, 'Invalid event ID', null);
  }
  next();
};

const updateEventSchema = Joi.object({
  name: Joi.string().trim().optional(),
  description: Joi.string().trim().optional(),
  ticketPrice: Joi.number().positive().optional(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
  maxTicketCount: Joi.number().positive().optional()
}).or('name', 'description', 'ticketPrice', 'startDate', 'endDate', 'maxTicketCount'); // Ensure at least one is provided

export const validateEventUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const { error } = updateEventSchema.validate(req.body);
  if (error) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, null);
  }
  next();
};
