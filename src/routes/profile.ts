import CONSTANT from "entity/const/";
import express from "express";
import { updateCustomer } from "handler/update_customer/";
import { updateEO } from "handler/update_eo/";
import { auth } from "middleware/auth/";
import { checkRole } from "middleware/check_role/";

const router = express.Router();

router.put("/profile/customer/update", auth, checkRole(CONSTANT.ROLE.CUSTOMER), updateCustomer);
router.put("/profile/eo/update", auth, checkRole(CONSTANT.ROLE.EO), updateEO);

export default router;