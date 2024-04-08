import { Request, Response } from "express";
import Event from "entity/event.model";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const event = new Event(req.body);
    await event.save(); // saving to database (mongoDB)
    sendResponse(res, 201, "Event created successfully", event);
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error", null);
    logError(req, res, "Error creating an event", error);
  }
};

export const readEvents = async (req: Request, res: Response) => {
  try {
    const events = await Event.find();
    sendResponse(res, 200, null, events);
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error", null);
    logError(req, res, "Error fetching events", error);
  }
};

export const findEventById = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return sendResponse(res, 404, `Event with ID ${eventId} not found`, null);
    }
    sendResponse(res, 200, null, event);
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error", null);
    logError(req, res, "Error finding event by ID", error);
  }
};

export const updateEventById = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;
  const updateData = req.body;

  try {
    const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, {
      new: true,
    });

    if (!updatedEvent) {
      return sendResponse(res, 404, `Event with ID ${eventId} not found`, null);
    }

    sendResponse(
      res,
      200,
      `Successfully updated event with ID ${eventId}`,
      updatedEvent
    );
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error", null);
    logError(req, res, "Error updating event by ID", error);
  }
};

export const deleteEventById = async (req: Request, res: Response) => {
  const eventId = req.params.eventId;

  try {
    const deletedEvent = await Event.findByIdAndDelete(eventId);

    if (!deletedEvent) {
      return sendResponse(res, 404, `Event with ID ${eventId} not found`, null);
    }

    sendResponse(res, 204, "Event deleted successfully", null);
  } catch (error) {
    sendResponse(res, 500, "Internal Server Error", null);
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
