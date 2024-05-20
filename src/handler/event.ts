import { Request, Response } from "express";
import { Event } from "model/event/";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import CONSTANT from "entity/const/";
import User from "model/user/";
import EventOrganizer from "model/event_organizer/";

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
    logError(req, res, "Error creating an event", error);
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
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
    logError(req, res, "Error updating event by title", error);
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
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
    } else {
      return sendResponse(res, StatusCodes.UNAUTHORIZED, "Unauthorized", null);
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
    logError(req, res, "Error deleting event by id", error);
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
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
    const organizer = await EventOrganizer.findOne({ userId: event.ownerId });

    const user = await User.findOne({ _id: event.ownerId });
    console.log(user);

    return sendResponse(
      res,
      StatusCodes.OK,
      "Event details retrieved successfully",
      {
        event,
        ownerName: user ? user.name : null,
        organizer: organizer ? organizer : null,
        eoProfilePicture: user ? user.profilePictureUrl : null,
      }
    );
  } catch (error) {
    logError(req, res, "Error fetching event details", error);
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
  }
};

export const viewEvents = async (req: Request, res: Response) => {
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
    const skip = (page - 1) * limit;
    const query = Event.find().sort({ startDate: 1 });
    const [events, totalEvents] = await Promise.all([
      query.skip(skip).limit(limit),
      Event.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalEvents / limit);

    //Prevent sending multiple responses
    if (handlePaginationError(res, page, totalPages)) {
      return;
    }

    // Extract ownerId and find user details
    const ownerIds = events.map((event) => event.ownerId);
    const users = await User.find({ _id: { $in: ownerIds } }).select(
      "_id name"
    );

    // Create a map for easy lookup
    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.name])
    );

    // Add user details to events
    const eventsWithOwnerName = events.map((event) => ({
      ...event.toObject(),
      ownerName: userMap.get(event.ownerId.toString()) || null,
    }));

    return sendResponse(res, StatusCodes.OK, "Events retrieved successfully", {
      events: eventsWithOwnerName,
      totalEvents,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    logError(req, res, "Error fetching events", error);
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
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
  if (value.status){
    const currentDate = new Date().getTime();
    if (value.status === CONSTANT.STATUS_EVENT.UPCOMING) {
      queryConditions.startDate = { $gte: currentDate };
    } else if (value.status === CONSTANT.STATUS_EVENT.PAST) {
      queryConditions.startDate = { $lt: currentDate };
    }
  }

  try {
    const events = await Event.find(queryConditions)
        .sort({ startDate: 1 }) // Sorting by start date ascending
        .skip((value.page - 1) * value.limit)
        .limit(value.limit)
        .exec();

    const totalEvents = await Event.countDocuments(queryConditions);
    const totalPages = Math.ceil(totalEvents / value.limit);

    //Prevent sending multiple responses
    if (handlePaginationError(res, value.page, totalPages)) {
      return;
    }
    // Extract ownerId and find user details
    const ownerIds = events.map((event) => event.ownerId);
    const users = await User.find({ _id: { $in: ownerIds } }).select(
      "_id name"
    );

    // Create a map for easy lookup
    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.name])
    );

    // Add user details to events
    const eventsWithOwnerName = events.map((event) => ({
      ...event.toObject(),
      ownerName: userMap.get(event.ownerId.toString()) || null,
    }));

    return sendResponse(res, StatusCodes.OK, "Events retrieved successfully", {
      events: eventsWithOwnerName,
      page: value.page,
      totalPages: totalPages,
    });
  } catch (error) {
    logError(req, res, "Error fetching events", error);
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal server error",
      null
    );
  }
};

export const viewEventEo = async (req: Request, res: Response) => {
  const {
    value: { page, limit, status },
    error,
  } = statusAndPaginationSchema.validate(req.query);

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

    const userId = req.user._id;
    queryConditions = { ownerId: userId };

    const currentDate = new Date().getTime();
    if (status === CONSTANT.STATUS_EVENT.UPCOMING) {
      queryConditions.startDate = { $gte: currentDate };
    } else if (status === CONSTANT.STATUS_EVENT.PAST) {
      queryConditions.startDate = { $lt: currentDate };
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

    // Extract ownerId and find user details
    const ownerIds = events.map((event) => event.ownerId);
    const users = await User.find({ _id: { $in: ownerIds } }).select(
      "_id name"
    );

    // Create a map for easy lookup
    const userMap = new Map(
      users.map((user) => [user._id.toString(), user.name])
    );

    // Add user details to events
    const eventsWithOwnerName = events.map((event) => ({
      ...event.toObject(),
      ownerName: userMap.get(event.ownerId.toString()),
    }));

    return sendResponse(res, StatusCodes.OK, "Events retrieved successfully", {
      events: eventsWithOwnerName,
      totalEvents,
      currentPage: page,
      totalPages: totalPages,
    });
  } catch (error) {
    logError(req, res, "Error fetching events", error);
    return sendResponse(
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
const paginationSchema = Joi.object({
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
  status: Joi.string().valid("upcoming", "past").optional(),
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
