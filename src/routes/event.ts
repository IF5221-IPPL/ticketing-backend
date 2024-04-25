import express from 'express';
import { createEvent, readEvents, findEventById, updateEventByTitle, deleteEventById } from '../handler/event';
import { validateEventData, validateEventId, validateEventTitle } from '../middleware/event';
import { auth } from '../middleware/auth';
import { checkRole } from 'middleware/check_role/';
import { singleUpload } from 'middleware/upload/';
import { uploadSingleFile } from 'handler/file/';

const router = express.Router();

const EO_ROLE = "eo";

router.post('/poster', auth, checkRole(EO_ROLE), singleUpload, uploadSingleFile);
router.post('/event',  auth, checkRole(EO_ROLE), validateEventData, createEvent);
router.get('/events',  auth, checkRole(EO_ROLE),  readEvents);
router.get('/event/:eventId', auth, checkRole(EO_ROLE), validateEventId, findEventById);
router.put('/event/:eventTitle',  auth, checkRole(EO_ROLE), validateEventTitle, validateEventData, updateEventByTitle); 
router.delete('/event/:eventId',  auth, checkRole(EO_ROLE), validateEventId, deleteEventById); 

export default router;
