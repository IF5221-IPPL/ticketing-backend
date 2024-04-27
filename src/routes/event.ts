import express from "express";
import {
  createEvent,
  updateEventById,
  deleteEventByIdEo,
  deleteEventByIdAdmin,
  viewEventDetails,
  viewEvents,
  viewAllEventsWithFilter,
} from "../handler/event";
import { validateEventData, validateEventId } from "../middleware/event";
import { auth } from "../middleware/auth";
import { checkRole } from "middleware/check_role/";
import { singleUpload } from "middleware/upload/";
import { uploadSingleFile } from "handler/file/";

const router = express.Router();

const EO_ROLE = "eo";
const ADMIN_ROLE = "admin";
const CUSTOMER_ROLE = "customer";

router.post(
  "/posters",
  auth,
  checkRole(EO_ROLE),
  singleUpload,
  uploadSingleFile
);

router.post(
  "/events",
  auth,
  checkRole(EO_ROLE),
  validateEventData,
  createEvent
);

router.put(
  "/events/:eventId",
  auth,
  checkRole(EO_ROLE),
  validateEventId,
  validateEventData,
  updateEventById
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

router.get("/events", auth, viewEvents);

router.get("/events/filtered", auth, viewAllEventsWithFilter);

export default router;
