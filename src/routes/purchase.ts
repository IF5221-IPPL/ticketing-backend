import CONSTANT from "entity/const/";
import express from "express";
import { createPurchase } from "handler/create_purchase/";
import { getPurchases } from "handler/get_purchases/";
import { auth } from "middleware/auth/";
import { checkRole } from "middleware/check_role/";

const router = express.Router();

router.post(
    "/purchases",
    auth,
    checkRole(CONSTANT.ROLE.EO),
    createPurchase    
);

router.get(
    "/purchases",
    auth,
    checkRole(CONSTANT.ROLE.EO),
    getPurchases
);

export default router;
