import { Request, Response } from "express";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import { Logger } from "pkg/logger/";
import TicketPurchase from "model/ticket_purchase/";

export const getTicketDetail = async (req: Request, res: Response) => {    
    try { 
        const ticket = await TicketPurchase.findById(req.params.ticketId);
        return sendResponse(res, StatusCodes.OK, "Ticket retrieved successfully", ticket);
    } catch (err) {
        Logger.error(
			{
				message: "Failed to retrieve ticket detail",
                request: {
                    ticketId: req.params.ticketId,
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