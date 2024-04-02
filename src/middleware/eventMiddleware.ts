import { Request, Response, NextFunction } from 'express';
import { isValidObjectId } from 'mongoose';

export const validateEventData = (req: Request, res: Response, next: NextFunction) => {
  const { name, desc, tickerPrice, startDate, maxTicketCount, endDate } = req.body;

  if (!name || !desc || !tickerPrice || !startDate || !maxTicketCount || !endDate) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    return res.status(400).json({ message: 'Name must be a non-empty string' });
  }

  if (typeof desc !== 'string' || desc.trim().length === 0) {
    return res.status(400).json({ message: 'Description must be a non-empty string' });
  }

  if (typeof tickerPrice !== 'number' || isNaN(tickerPrice) || tickerPrice <= 0) {
    return res.status(400).json({ message: 'Ticker price must be a positive number' });
  }

  const parsedStartDate = new Date(startDate);
  if (isNaN(parsedStartDate.getTime())) {
    return res.status(400).json({ message: 'Start date is invalid' });
  }

  if (typeof maxTicketCount !== 'number' || isNaN(maxTicketCount) || maxTicketCount <= 0) {
    return res.status(400).json({ message: 'Max ticket count must be a positive number' });
  }

  const parsedEndDate = new Date(endDate);
  if (isNaN(parsedEndDate.getTime()) || parsedEndDate <= parsedStartDate) {
    return res.status(400).json({ message: 'End date is invalid' });
  }

  // If all validations pass, proceed to the next middleware/handler
  next();
};

export const validateEventId = (req: Request, res: Response, next: NextFunction) => {
  const eventId = req.params.eventId;

  // Check if eventId is a valid ObjectId
  if (!isValidObjectId(eventId)) {
      return res.status(400).json({ message: 'Invalid event ID' });
  }

  // If validation passes, proceed to the next middleware/handler
  next();
};