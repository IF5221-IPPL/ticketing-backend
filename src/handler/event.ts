import { Request, Response } from "express";
import { Event } from "model/event/";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const existingEventTitle = await Event.findOne({
      eventTitle: req.body.eventTitle,
    });
    if (existingEventTitle) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Event already exists",
        null
      );
    } else {
      req.body.ownerId = req.user._id;
      const event = new Event(req.body);
      await event.save();
      return sendResponse(
        res,
        StatusCodes.CREATED,
        "Event created successfully",
        event
      );
    }
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "Error creating an event", error);
  }
};

export const readEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    return sendResponse(res, StatusCodes.OK, null, events);
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "Error fetching events", error);
  }
};

export const findEventById = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        `Event with ID ${eventId} not found`,
        null
      );
    }
    return sendResponse(res, StatusCodes.OK, null, event);
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "Error finding event by ID", error);
  }
};

export const updateEventByTitle = async (req: Request, res: Response) => {
  try {
    const { eventTitle } = req.params;
    const existingEvent = await Event.findOne({ eventTitle });
    if (!existingEvent) {
      return sendResponse(res, StatusCodes.NOT_FOUND, "Event not found", null);
    };

    const existingEventWithNewTitle = await Event.findOne({
      eventTitle: req.body.eventTitle,
      _id: { $ne: existingEvent._id }, 
    });

    if (existingEventWithNewTitle) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Event title already exists, please find another title! ",
        null
      );
    }

    const updatedEvent = await Event.findOneAndUpdate(
      { eventTitle },
      { $set: req.body },
      { new: true }
    );

    return sendResponse(
      res,
      StatusCodes.OK,
      `Event with title ${eventTitle} successfully updated!`,
      updatedEvent
    );
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "Error updating event by title", error);
  }
};

export const deleteEventById = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        `Event with ID ${eventId} not found`,
        null
      );
    }

    return sendResponse(
      res,
      StatusCodes.NO_CONTENT,
      "Event deleted successfully",
      null
    );
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "Error deleting event by ID", error);
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
