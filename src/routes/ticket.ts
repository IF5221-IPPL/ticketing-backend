import CONSTANT from "entity/const/";
import express from "express";
import { buyTicket } from "handler/buy_ticket/";
import { getTickets } from "handler/get_tickets/";
import { getTicketDetail } from "handler/get_ticket_detail/";
import { auth } from "middleware/auth/";
import { checkRole } from "middleware/check_role/";

const router = express.Router();

router.post(
    "/events/:eventId/purchase-tickets",
    auth,
    checkRole(CONSTANT.ROLE.CUSTOMER),
    buyTicket    
);

router.get(
    "/tickets",
    auth,
    checkRole(CONSTANT.ROLE.CUSTOMER),
    getTickets
)

router.get(
    "/tickets/:ticketId",
    auth,
    checkRole(CONSTANT.ROLE.CUSTOMER),
    getTicketDetail
)

export default router;
