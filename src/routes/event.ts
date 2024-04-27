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
  "/eo/events/:eventId",
  auth,
  checkRole(CONSTANT.ROLE.EO),
  validateEventId,
  deleteEventByIdEo
);

router.delete(
  "/admin/events/:eventId",
  auth,
  checkRole(CONSTANT.ROLE.ADMIN),
  validateEventId,
  deleteEventByIdAdmin
);

router.get("/events/:eventId", auth, validateEventId, viewEventDetails);

router.get("/events", auth, viewEvents);

router.get("/events/filtered", auth, viewAllEventsWithFilter);

export default router;
