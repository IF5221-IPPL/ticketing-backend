import express from "express";
import {
  createEvent,
  updateEventById,
  deleteEvent,
  viewEventDetails,
  viewEvents,
  viewAllEventsWithFilter,
} from "../handler/event";
import { validateEventData, validateEventId } from "../middleware/event";
import { auth } from "../middleware/auth";
import { checkRole } from "middleware/check_role/";
import { singleUpload } from "middleware/upload/";
import { uploadSingleFile } from "handler/file/";
import CONSTANT from "entity/const/";

const router = express.Router();

router.post(
  "/posters",
  auth,
  checkRole(CONSTANT.ROLE.EO),
  singleUpload,
  uploadSingleFile
);

router.post(
  "/events",
  auth,
  checkRole(CONSTANT.ROLE.EO),
  validateEventData,
  createEvent
);

router.put(
  "/events/:eventId",
  auth,
  checkRole(CONSTANT.ROLE.EO),
  validateEventId,
  validateEventData,
  updateEventById
);

router.delete(
  "/events/:eventId",
  auth,
  validateEventId,
  deleteEvent
);

// should put here, Don't Change this hierarchy.
// Note: since route "/events/:eventId" can match "filtered" param,
// we have to put "event/filtered" routes before "events/:eventId".
router.get("/events/filtered", auth, viewAllEventsWithFilter);

router.get("/events/:eventId", validateEventId, viewEventDetails);

router.get("/events", viewEvents);

export default router;
