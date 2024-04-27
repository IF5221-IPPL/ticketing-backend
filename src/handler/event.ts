import { Request, Response } from "express";
import { Event } from "model/event/";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import CONSTANT from "entity/const/";

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

export const updateEventById = async (req: Request, res: Response) => {
  try {
    const eventId = req.params.eventId;
    const updateEvent = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateEvent, {
      new: true,
      runValidators: true,
    });

    return sendResponse(
      res,
      StatusCodes.OK,
      `Event with Id ${eventId} successfully updated!`,
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

export const deleteEvent = async (req: Request, res: Response) => {
  const userRole = req.user.role;
  const userId = req.user._id;
  const eventId = req.params.eventId;
  let deletedEvent;

  try {
    if (userRole === CONSTANT.ROLE.EO) {
      deletedEvent = await Event.findOneAndDelete({
        _id: eventId,
        ownerId: userId,
      });
    } else if (userRole === CONSTANT.ROLE.ADMIN) {
      deletedEvent = await Event.findByIdAndDelete(eventId);
    }

    if (!deletedEvent) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        `Event with id ${eventId} not found`,
        null
      );
    }

    return sendResponse(
      res,
      StatusCodes.NO_CONTENT,
      `Event with title ${eventId} deleted successfully`,
      null
    );
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    logError(req, res, "Error deleting event by id", error);
  }
};

export const viewEventDetails = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return sendResponse(
        res,
        StatusCodes.NOT_FOUND,
        `Event with Id ${eventId} not found`,
        null
      );
    }
    return sendResponse(
      res,
      StatusCodes.OK,
      "Event details retrieved successfully",
      event
    );
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

export const viewEvents = async (req: Request, res: Response) => {
  const userRole = req.user.role;
  const paginationSchema =
    userRole === CONSTANT.ROLE.EO
      ? statusAndPaginationSchema
      : pagiantionSchema;
  const {
    value: { page, limit, status }, // 'status' will be undefined if not provided by a non-EO user
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
    let queryConditions: any = {};
    const skip = (page - 1) * limit;

    if (userRole === CONSTANT.ROLE.EO) {
      const userId = req.user._id;
      queryConditions = { ownerId: userId };

      const currentDate = new Date().getTime();
      if (status === CONSTANT.STATUS_EVENT.UPCOMING) {
        queryConditions.startDate = { $gte: currentDate };
      } else if (status === CONSTANT.STATUS_EVENT.PAST) {
        queryConditions.startDate = { $lt: currentDate };
      }
    }

    const query = Event.find(queryConditions).sort({ startDate: 1 });

    const [events, totalEvents] = await Promise.all([
      query.skip(skip).limit(limit),
      Event.countDocuments(queryConditions),
    ]);

    const totalPages = Math.ceil(totalEvents / limit);

    //Prevent sending multiple responses
    if (handlePaginationError(res, page, totalPages)) {
      return;
    }
    return sendResponse(res, StatusCodes.OK, "Events retrieved successfully", {
      events,
      totalEvents,
      currentPage: page,
      totalPages: totalPages,
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
  const { error, value } = eventFilterSchema.validate(req.query);
  let queryConditions: any = {};

  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }
  if (value.searchByEventTitle) {
    queryConditions.eventTitle = {
      $regex: value.searchByEventTitle,
      $options: "i",
    };
  }
  if (value.location) {
    queryConditions.location = { $regex: value.location, $options: "i" };
  }
  if (value.startDate && value.endDate) {
    queryConditions.startDate = {
      $gte: new Date(value.startDate),
      $lte: new Date(value.endDate),
    };
  }

  try {
    const [events, totalEvents] = await Promise.all([
      Event.find(queryConditions)
        .sort({ startDate: 1 }) // Sorting by start date ascending
        .skip((value.page - 1) * value.limit)
        .limit(value.limit)
        .exec(),
      Event.countDocuments(queryConditions),
    ]);

    const totalPages = Math.ceil(totalEvents / value.limit);

    //Prevent sending multiple responses
    if (handlePaginationError(res, value.page, totalPages)) {
      return;
    }

    return sendResponse(res, StatusCodes.OK, "Events retrieved successfully", {
      events,
      page: value.page,
      totalPages: Math.ceil(totalPages / value.limit),
    });
  } catch (error) {
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal server error",
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
const pagiantionSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
});

const statusAndPaginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(25),
  status: Joi.string().valid("upcoming", "past").optional(),
});

const eventFilterSchema = Joi.object({
  searchByEventTitle: Joi.string().trim().optional(),
  location: Joi.string().trim().optional(),
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).optional(),
  page: Joi.alternatives([
    Joi.number().integer().min(1),
    Joi.string()
      .trim()
      .custom((value) => parseInt(value, 10), "custom number parsing"),
  ]).default(1),
  limit: Joi.alternatives([
    Joi.number().integer().min(1).max(100),
    Joi.string()
      .trim()
      .custom((value) => parseInt(value, 10), "custom number parsing"),
  ]).default(25),
});
