import CONSTANT from "entity/const/";
import express from "express";
import { buyTicket } from "handler/buy_ticket/";
import { auth } from "middleware/auth/";
import { checkRole } from "middleware/check_role/";

const router = express.Router();

router.post(
    "/events/:eventId/purchase-tickets",
    auth,
    checkRole(CONSTANT.ROLE.CUSTOMER),
    buyTicket    
);

export default router;
