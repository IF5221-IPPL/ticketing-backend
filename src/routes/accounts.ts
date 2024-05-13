import express from "express";

import { auth } from "../middleware/auth";

import CONSTANT from "entity/const/";
import { deleteAccount, viewAccounts } from "handler/account_management/";

const router = express.Router();

// should put here, Don't Change this hierarchy.
// Note: since route "/events/:eventId" can match "filtered" param,
// we have to put "event/filtered" routes before "events/:eventId".
// router.get("/events/filtered", auth, viewAllEventsWithFilter);

// router.get("/events/:eventId", auth, validateEventId, viewEventDetails);

router.get("/accounts", viewAccounts);
router.delete("/accounts/:accountId", deleteAccount)

export default router;
