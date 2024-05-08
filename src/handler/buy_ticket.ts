import { Request, Response } from "express";
import { Event } from "model/event";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { Logger } from "pkg/logger/";
import { ITicketPurchaseResponse } from "entity/transaction_detail/";

export const buyTicket = async (req: Request, res: Response) => {
  const { eventId } = req.params;
  const { categoryName, numberOfTickets } = req.body;

  // Validate input using Joi
  const { error } = ticketPurchaseSchema.validate({
    eventId,
    categoryName,
    numberOfTickets,
  });

  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }

  try {
    // Check availability and update tickets atomically
    const event = await Event.findOne({
      _id: eventId,
      "tickets.categoryName": categoryName,
    });

    if (!event) {
      return sendResponse(res, StatusCodes.NOT_FOUND, "Event not found", null);
    }

    const category = event.tickets.find(
      (cat) => cat.categoryName === categoryName
    );
    if (category.totalTickets < numberOfTickets) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        "Insufficient tickets available",
        null
      );
    }

    await Event.updateOne(
      { _id: eventId, "tickets.categoryName": categoryName },
      { $inc: { "tickets.$.totalTickets": -numberOfTickets } }
    );

    const amount = numberOfTickets * category.pricePerTicket;

    // TODO: Implement payment logic here
    // Simulate successful payment or integrate with a payment service

    const responsePayment: ITicketPurchaseResponse = {
      transaction: {
        id: eventId,
        category: categoryName,
        amount: amount,
        numberOfTickets: numberOfTickets,
      },
      event: {
        title: event.eventTitle,
        startDate: event.startDate,
        endDate: event.endDate,
      },
    };
    return sendResponse(
      res,
      StatusCodes.OK,
      "Ticket purchased successfully",
      responsePayment
    );
  } catch (error) {
    Logger.error({
      message: error,
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
        message: error.message,
        stack: error.stack,
      },
    });
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
  }
};

// Define the Joi schema for validating ticket purchase requests
const ticketPurchaseSchema = Joi.object({
  eventId: Joi.string()
    .hex()
    .length(24)
    .required()
    .description("The unique identifier of the event"),
  categoryName: Joi.string()
    .required()
    .description("The name of the ticket category"),
  numberOfTickets: Joi.number()
    .integer()
    .min(1)
    .required()
    .description("The number of tickets to purchase"),
});
