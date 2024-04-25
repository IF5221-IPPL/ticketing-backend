import { Request, Response } from "express";
import { Event } from "model/event/";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import { IQueryParams } from "entity/queryParam/";

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
    }

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

export const deleteEventByeventTitleEo = async (
  req: Request,
  res: Response
) => {
  const selectedEventTitle = req.query.eventTitle;
  const userID = req.user._id;

  try {
    const deletedEvent = await Event.findOneAndDelete({
      eventTitle: selectedEventTitle,
      ownerId: userID,
    });

    if (!deletedEvent) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        `Event with title ${selectedEventTitle} not found`,
        null
      );
    }

    return sendResponse(
      res,
      StatusCodes.NO_CONTENT,
      `Event with title ${selectedEventTitle} deleted successfully`,
      null
    );
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "Error deleting event by title", error);
  }
};

export const deleteEventByeventTitleAdmin = async (
  req: Request,
  res: Response
) => {
  const selectedEventTitle = req.query.eventTitle;
  try {
    const deletedEvent = await Event.findOneAndDelete(selectedEventTitle);

    if (!deletedEvent) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        `Event with title ${selectedEventTitle} not found`,
        null
      );
    }

    return sendResponse(
      res,
      StatusCodes.NO_CONTENT,
      `Event with title ${selectedEventTitle} deleted successfully`,
      null
    );
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "Error deleting event by title", error);
  }
};

export const viewEventDetails = async (req: Request, res: Response) => {
  const selectedEventTitle = req.query.eventTitle;

  try {
    const event = await Event.findOne({ eventTitle: selectedEventTitle });
    if (!event) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        `Event with title ${selectedEventTitle} not found`,
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
    logError(req, res, "Error fetching event details", error);
  }
};

export const viewAllEvents = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page) || 1; // default to page 1
  const limit = parseInt(req.query.limit) || 25; // default limit to 25 items per page
  try {
    const skip = (page - 1) * limit;
    const events = await Event.find({})
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit);
    const totalEvents = await Event.countDocuments();
    return sendResponse(res, StatusCodes.OK, "Events retrieved successfully", {
      events,
      totalEvents,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / limit),
    });
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

export const viewAllEventsEo = async (req: Request, res: Response) => {
  const { status, page = 1, limit = 25 } = req.query;
  const userId = req.user._id;

  try {
    let query = Event.find({ ownerId: userId });

    if (status) {
      const currentDate = new Date().getTime();
      if (status === "upcoming") {
        query = query.where("startDate").gte(currentDate);
      } else if (status === "past") {
        query = query.where("startDate").lt(currentDate);
      }
    }
    const startIndex = (page - 1) * limit;
    const events = await query.skip(startIndex).limit(parseInt(limit)).exec();
    const totalEvents = await Event.countDocuments({ ownerId: userId });
    return sendResponse(res, StatusCodes.OK, "Events retrieved successfully", {
      events,
      totalEvents,
      currentPage: page,
      totalPages: Math.ceil(totalEvents / limit),
    });
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

export const viewAllEventsWithFilter = async (req: Request, res: Response) => {
  const {
    search,
    location,
    startDate,
    endDate,
    page = 1,
    limit = 25,
  }: IQueryParams = req.query;
  const query: any = {};

  if (search) {
    query.eventTitle = { $regex: search, $options: "i" };
  }
  if (location) {
    query.location = { $regex: location, $options: "i" };
  }

  if (startDate && endDate) {
    query.startDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  try {
    const totalCount = await Event.countDocuments(query);
    const events = await Event.find(query)
      .sort({ startDate: 1 }) // Sort by nearest event start date, ascending
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return sendResponse(res, StatusCodes.OK, null, {
      events,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "error fetching events for EO", error);
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
