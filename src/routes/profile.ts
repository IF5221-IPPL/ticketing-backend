import CONSTANT from "entity/const/";
import express from "express";
import { updateCustomer } from "handler/update_customer/";
import { updateEO } from "handler/update_eo/";
import { auth } from "middleware/auth/";
import { checkRole } from "middleware/check_role/";
import { getEO } from "handler/get_eo/";
import { getUser } from 'handler/get_user/';

const router = express.Router();

router.get("/profile/eo/:userId", auth, checkRole(CONSTANT.ROLE.EO), getEO);
router.get("/profile/:userId", auth, getUser);
router.put("/profile/customer/update", auth, checkRole(CONSTANT.ROLE.CUSTOMER), updateCustomer);
router.put("/profile/eo/update", auth, checkRole(CONSTANT.ROLE.EO), updateEO);

export default router;