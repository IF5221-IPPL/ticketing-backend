import express from 'express';
import { createEvent, readEvents, findEventById, updateEventById, deleteEventById } from '../handler/event';
import { validateEventData, validateEventUpdateData } from '../middleware/event';
import { auth } from '../middleware/auth';
import { checkRole } from 'middleware/check_role/';

const router = express.Router();

const EO_ROLE = "EO";

router.post('/event',  auth, checkRole(EO_ROLE), validateEventData, createEvent);
router.get('/events',  auth, checkRole(EO_ROLE),  readEvents);
router.get('/event/:eventId', auth, checkRole(EO_ROLE), findEventById);
router.put('/event/:eventId',  auth, checkRole(EO_ROLE), validateEventUpdateData,updateEventById); 
router.delete('/event/:eventId',  auth, checkRole(EO_ROLE), deleteEventById); 

export default router;
