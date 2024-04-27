import express from "express";
import { createEvent, updateEventById } from "../handler/event";
import { validateEventData, validateEventId } from "../middleware/event";
import { auth } from "../middleware/auth";
import { checkRole } from "middleware/check_role/";
import { singleUpload } from "middleware/upload/";
import { uploadSingleFile } from "handler/file/";

const router = express.Router();

const EO_ROLE = "eo";

router.post(
  "/poster",
  auth,
  checkRole(EO_ROLE),
  singleUpload,
  uploadSingleFile
);
router.post(
  "/event", 
  auth, 
  checkRole(EO_ROLE), 
  validateEventData, 
  createEvent);

router.put(
  "/event/:eventTitle",
  auth,
  checkRole(EO_ROLE),
  validateEventId,
  validateEventData,
  updateEventById
);

export default router;
