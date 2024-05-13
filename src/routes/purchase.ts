import CONSTANT from "entity/const/";
import express from "express";
import { createPurchase } from "handler/create_purchase/";
import { auth } from "middleware/auth/";
import { checkRole } from "middleware/check_role/";

const router = express.Router();

router.post(
    "/purchases",
    auth,
    checkRole(CONSTANT.ROLE.EO),
    createPurchase    
);

export default router;
