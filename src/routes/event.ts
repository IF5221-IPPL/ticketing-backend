import express from "express";
import {
  createEvent,
  updateEventByTitle,
  deleteEventByIdEo,
  deleteEventByIdAdmin,
  viewEventDetails,
  viewAllEvents,
  viewAllEventsWithFilter,
  viewEventsByEo,
} from "../handler/event";
import {
  validateEventData,
  validateEventId,
  validateEventTitle,
} from "../middleware/event";
import { auth } from "../middleware/auth";
import { checkRole } from "middleware/check_role/";
import { singleUpload } from "middleware/upload/";
import { uploadSingleFile } from "handler/file/";

const router = express.Router();

const EO_ROLE = "eo";
const ADMIN_ROLE = "admin";
const CUSTOMER_ROLE = "customer";

router.post(
  "/poster",
  auth,
  checkRole(EO_ROLE),
  singleUpload,
  uploadSingleFile
);
router.post("/event", auth, checkRole(EO_ROLE), validateEventData, createEvent);

router.put(
  "/event/:eventTitle",
  auth,
  checkRole(EO_ROLE),
  validateEventTitle,
  validateEventData,
  updateEventByTitle
);
router.delete(
  "/eo/events/:eventId",
  auth,
  checkRole(EO_ROLE),
  validateEventId,
  deleteEventByIdEo
);

router.delete(
  "/admin/events/:eventId",
  auth,
  checkRole(ADMIN_ROLE),
  validateEventId,
  deleteEventByIdAdmin
);

router.get("/events/:eventId", auth, validateEventId, viewEventDetails);

router.get("/events", auth, validateEventId, viewAllEvents);

router.get("/eo/events", auth, checkRole(EO_ROLE), viewEventsByEo);

router.get("/events/filtered", auth, viewAllEventsWithFilter);

export default router;
