import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';
import { sendResponse } from 'pkg/http/';


export const validateEventData = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, ticketPrice, startDate, maxTicketCount, endDate } = req.body;

  if (!name || !description || !ticketPrice || !startDate || !maxTicketCount || !endDate) {
    return sendResponse(res, 400, 'All event fields must be provided', null);
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    return sendResponse(res, 400, 'Event name must be a non-empty string', null);
  }

  if (typeof description !== 'string' || description.trim().length === 0) {
    return sendResponse(res, 400, 'Event description must be a non-empty string', null);
  }

  if (typeof ticketPrice !== 'number' || ticketPrice <= 0) {
    return sendResponse(res, 400, 'Ticket price must be a positive number', null);
  }

  const parsedStartDate = new Date(startDate);
  if (isNaN(parsedStartDate.getTime())) {
    return sendResponse(res, 400, 'Start date is invalid', null);
  }

  const now = new Date();
  if (parsedStartDate < now) {
    return sendResponse(res, 400, 'Start date cannot be in the past', null);
  }

  if (typeof maxTicketCount !== 'number' || maxTicketCount <= 0) {
    return sendResponse(res, 400, 'Max ticket count must be a positive number', null);
  }

  const parsedEndDate = new Date(endDate);
  if (isNaN(parsedEndDate.getTime()) || parsedEndDate <= parsedStartDate) {
    return sendResponse(res, 400, 'End date must be after the start date', null);
  }

  next();
};

export const validateEventId = (req: Request, res: Response, next: NextFunction) => {
  const eventId = req.params.eventId;

  if (!isValidObjectId(eventId)) {
    return sendResponse(res, 400, 'Invalid event ID', null);
  }

  next();
};

// Middleware for validating event data on update (partial updates allowed)
export const validateEventUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, ticketPrice, startDate, maxTicketCount, endDate } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return sendResponse(res, 400, 'Event name must be a non-empty string if provided', null);
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
    return sendResponse(res, 400, 'Event description must be a non-empty string if provided', null);
  }

  if (ticketPrice !== undefined && (typeof ticketPrice !== 'number' || ticketPrice <= 0)) {
    return sendResponse(res, 400, 'Ticket price must be a positive number if provided', null);
  }

  if (startDate !== undefined) {
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return sendResponse(res, 400, 'Start date must be a valid date if provided', null);
    }
  }

  if (maxTicketCount !== undefined && (typeof maxTicketCount !== 'number' || maxTicketCount <= 0)) {
    return sendResponse(res, 400, 'Max ticket count must be a positive number if provided', null);
  }

  if (endDate !== undefined) {
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      return sendResponse(res, 400, 'End date must be a valid date if provided', null);
    }

    // If both start and end dates are provided, check that end date is after start date
    if (startDate !== undefined && new Date(endDate) <= new Date(startDate)) {
      return sendResponse(res, 400, 'End date must be after the start date if both are provided', null);
    }
  }

  next();
};
