import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';

export const validateEventData = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, ticketPrice, startDate, maxTicketCount, endDate } = req.body;

  if (!name || !description || !ticketPrice || !startDate || !maxTicketCount || !endDate) {
    return res.status(400).json({ message: 'All event fields must be provided' });
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Event name must be a non-empty string' });
  }

  if (typeof description !== 'string' || description.trim().length === 0) {
    return res.status(400).json({ message: 'Event description must be a non-empty string' });
  }

  if (typeof ticketPrice !== 'number' || ticketPrice <= 0) {
    return res.status(400).json({ message: 'Ticket price must be a positive number' });
  }

  const parsedStartDate = new Date(startDate);
  if (isNaN(parsedStartDate.getTime())) {
    return res.status(400).json({ message: 'Start date is invalid' });
  }

  const now = new Date();
  if (parsedStartDate < now) {
    return res.status(400).json({ message: 'Start date cannot be in the past' });
  }

  if (typeof maxTicketCount !== 'number' || maxTicketCount <= 0) {
    return res.status(400).json({ message: 'Max ticket count must be a positive number' });
  }

  const parsedEndDate = new Date(endDate);
  if (isNaN(parsedEndDate.getTime()) || parsedEndDate <= parsedStartDate) {
    return res.status(400).json({ message: 'End date must be after the start date' });
  }

  next();
};

export const validateEventId = (req: Request, res: Response, next: NextFunction) => {
  const eventId = req.params.eventId;

  if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
  }

  next();
};

// Middleware for validating event data on update (partial updates allowed)
export const validateEventUpdateData = (req: Request, res: Response, next: NextFunction) => {
  const { name, description, ticketPrice, startDate, maxTicketCount, endDate } = req.body;

  if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
    return res.status(400).json({ message: 'Event name must be a non-empty string if provided' });
  }

  if (description !== undefined && (typeof description !== 'string' || description.trim().length === 0)) {
    return res.status(400).json({ message: 'Event description must be a non-empty string if provided' });
  }

  if (ticketPrice !== undefined && (typeof ticketPrice !== 'number' || ticketPrice <= 0)) {
    return res.status(400).json({ message: 'Ticket price must be a positive number if provided' });
  }

  if (startDate !== undefined) {
    const parsedStartDate = new Date(startDate);
    if (isNaN(parsedStartDate.getTime())) {
      return res.status(400).json({ message: 'Start date must be a valid date if provided' });
    }
  }

  if (maxTicketCount !== undefined && (typeof maxTicketCount !== 'number' || maxTicketCount <= 0)) {
    return res.status(400).json({ message: 'Max ticket count must be a positive number if provided' });
  }

  if (endDate !== undefined) {
    const parsedEndDate = new Date(endDate);
    if (isNaN(parsedEndDate.getTime())) {
      return res.status(400).json({ message: 'End date must be a valid date if provided' });
    }

    // If both start and end dates are provided, check that end date is after start date
    if (startDate !== undefined && new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: 'End date must be after the start date if both are provided' });
    }
  }

  next();
};
