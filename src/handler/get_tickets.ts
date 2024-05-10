import { Request, Response } from "express";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { Logger } from "pkg/logger/";
import TicketPurchase from "model/ticket_purchase/";

const ticketFilterSchema = Joi.object({
    status: Joi.string().trim().valid('active', 'done').optional(),
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
    ]).default(10),
});

export const getTickets = async (req: Request, res: Response) => {
    const {
        value: { page, limit, status },
        error,
    } = ticketFilterSchema.validate(req.query);
    
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
        queryConditions.userId = req.user._id;

        // update ticket status to done where endDate is less than current date
        await TicketPurchase.updateMany({ endDate: { $lt: new Date() }, status: "active" }, { status: "done" }).exec();

        const skip = (page - 1) * limit;

        if (status) {
            queryConditions.status = status;
        } 
    
        const query = TicketPurchase.find(queryConditions).sort({ status: 1, eventStartDate: 1 });
    
        const [tickets, totalTickets] = await Promise.all([
          query.skip(skip).limit(limit),
          TicketPurchase.countDocuments(queryConditions),
        ]);
    
        const totalPages = Math.ceil(totalTickets / limit);

        if (handlePaginationError(res, page, totalPages)) {
          return;
        }

        return sendResponse(res, StatusCodes.OK, "Tickets retrieved successfully", {
          tickets,
          totalTickets,
          currentPage: page,
          totalPages: totalPages,
        });
    } catch (err) {
        Logger.error(
			{
				message: "Failed to retrieve tickets",
                request: {
                    userId: req.user._id,
                    status: req.query.status,
                    page: req.query.page,
                    limit: req.query.limit
                },
				error: { 
					message: err.message, 
					stack: err.stack 
				},
			}
        );
        sendResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Internal Server Error",
          null
        );
    }
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
        "Requested page exceeds the total number of pages, no tickets to show.",
        {
          tickets: [],
          totalTickets: 0,
          currentPage: page,
          totalPages,
        }
      );
      return true;
    }
    return false;
  };
  