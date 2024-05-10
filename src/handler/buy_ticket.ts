import { Request, Response } from "express";
import { Event } from "model/event";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { Logger } from "pkg/logger/";
import { IBuyTicketRequest, IBuyTicketResponse } from '../entity/buy_ticket';
import TicketPurchase from "model/ticket_purchase/";

const ticketPurchaseDetailSchema = Joi.object({
  categoryName: Joi.string()
    .required()
    .description("The name of the ticket category"),
  totalTickets: Joi.number()
    .integer()
    .min(1)
    .required()
    .description("The total number of tickets purchased in this category"),
  totalPrice: Joi.number()
    .precision(2)
    .positive()
    .required()
    .description("The total price for the tickets purchased in this category")
});

const ticketPurchaseSchema = Joi.object({
  eventId: Joi.string()
    .hex()
    .length(24)
    .required()
    .description("The unique identifier of the event"),
  detail: Joi.array()
    .items(ticketPurchaseDetailSchema)
    .min(1)
    .required()
    .description("Details of each ticket purchase by category")
});

export const buyTicket = async (req: Request, res: Response) => {
  let buyTicketReq: IBuyTicketRequest | null = null;
	let buyTicketRes: IBuyTicketResponse | null = null;

  try {
    const eventId = req.params.eventId;

    const { error } = ticketPurchaseSchema.validate({
      eventId: eventId,
      detail: req.body.detail,
    });
    if (error) {
      return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
    }

    let userId = req.user._id;
    buyTicketReq = req.body;

    const event = await Event.findOne({
      _id: eventId,
    });

    if (!event) {
      return sendResponse(res, StatusCodes.NOT_FOUND, "Event not found", null);
    }

    const newPurchase = await TicketPurchase.create({
      eventId: eventId,
      eventStartDate: event.startDate,
      eventEndDate: event.endDate,
      eventLocation: event.location,
      eventTitle: event.eventTitle,
      eventSubTitle: event.subTitle,
      userId: userId,
      category: buyTicketReq.detail
    });

    for (let detail of buyTicketReq.detail) {
      let eventTicket = await event.tickets.find(
        (cat) => cat.categoryName === detail.categoryName
      );

      if (detail.totalTickets > eventTicket.totalTickets) {
        return sendResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Insufficient tickets available",
          null
        );
      }

      await Event.updateOne(
        { _id: eventId, "tickets.categoryName": detail.categoryName },
        { $inc: { "tickets.$.totalTickets": -detail.totalTickets } }
      );
    }

    buyTicketRes = {
      _id: newPurchase._id,
      userId: newPurchase.userId,
      eventId: newPurchase.eventId,
      eventStartDate: newPurchase.eventStartDate.toISOString(),
      eventEndDate: newPurchase.eventEndDate.toISOString(),
      eventLocation: newPurchase.eventLocation,
      eventTitle: newPurchase.eventTitle,
      eventSubTitle: newPurchase.eventSubTitle,
      category: newPurchase.category,
      status: newPurchase.status,
      createdAt: newPurchase.createdAt.toISOString(),
      updatedAt: newPurchase.updatedAt?.toISOString(),
    }

    sendResponse(res, StatusCodes.OK, "Buy ticket success", buyTicketRes);
  } catch (err) {
    Logger.error(
      {
        message: "Failed to buy ticket",
        request: buyTicketReq,
        response: buyTicketRes,
        error: { 
          message: err.message, 
          stack: err.stack 
        },
      }
    )
      sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
  }
};

