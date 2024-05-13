import express from "express";
import { auth } from "../middleware/auth";
import CONSTANT from "entity/const/";
import {
  deleteAccount,
  updateActiveStatusAccount,
  viewAccounts,
  viewAccountsWithFiltered,
} from "handler/account_management/";
import { checkRole } from "middleware/check_role/";

const router = express.Router();

// should put here, Don't Change this hierarchy.
router.get(
  "/accounts/filtered",
  auth,
  checkRole(CONSTANT.ROLE.ADMIN),
  viewAccountsWithFiltered
);
router.get("/accounts", auth,
 checkRole(CONSTANT.ROLE.ADMIN), 
 viewAccounts);
 
router.delete(
  "/accounts/:accountId",
  auth,
  checkRole(CONSTANT.ROLE.ADMIN),
  deleteAccount
);
router.put(
  "/accounts/:accountId",
  auth,
  checkRole(CONSTANT.ROLE.ADMIN),
  updateActiveStatusAccount
);

export default router;
