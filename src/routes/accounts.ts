import express from "express";
import { auth } from "../middleware/auth";
import CONSTANT from "entity/const/";
import {
  deleteAccount,
  updateAccount,
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

router.delete(
  "/accounts/:accountId",
  auth,
  checkRole(CONSTANT.ROLE.ADMIN),
  deleteAccount
);
router.put(
  "/accounts/update",
  auth,
  checkRole(CONSTANT.ROLE.ADMIN),
  updateAccount
);

router.get("/accounts", auth, checkRole(CONSTANT.ROLE.ADMIN), viewAccounts);

export default router;
