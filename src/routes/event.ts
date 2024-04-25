import express from 'express';
import { createEvent, readEvents, findEventById, updateEventByTitle, deleteEventByeventTitleEo, deleteEventByeventTitleAdmin,
  viewEventDetails,
  viewAllEvents,
  viewAllEventsEo,
  viewAllEventsWithFilter
 } from '../handler/event';
import { validateEventData, validateEventId, validateEventTitle } from '../middleware/event';
import { auth } from '../middleware/auth';
import { checkRole} from 'middleware/check_role/';
import { singleUpload } from 'middleware/upload/';
import { uploadSingleFile } from 'handler/file/';

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
// router.get("/events", auth, checkRole(EO_ROLE), readEvents);
router.get(
  "/event/:eventId",
  auth,
  checkRole(EO_ROLE),
  validateEventId,
  findEventById
);
router.put(
  "/event/:eventTitle",
  auth,
  checkRole(EO_ROLE),
  validateEventTitle,
  validateEventData,
  updateEventByTitle
);
router.delete(
  "/eo/events",
  auth,
  checkRole(EO_ROLE),
  validateEventTitle,
  deleteEventByeventTitleEo
);

router.delete(
  "/admin/events",
  auth,
  checkRole(ADMIN_ROLE),
  validateEventTitle,
  deleteEventByeventTitleAdmin
);

router.get(
  "/event",
  auth, 
  checkRole(CUSTOMER_ROLE),
  validateEventTitle,
  viewEventDetails
)

router.get(
  "/events",
  auth,
  checkRole(CUSTOMER_ROLE),
  viewAllEvents
)

router.get(
  "/eo/events",
  auth,
  checkRole(EO_ROLE),
  viewAllEventsEo
)

router.get(
  "/eo/events/filtered",
  auth,
  checkRole(EO_ROLE),
  viewAllEventsWithFilter
)

export default router;
