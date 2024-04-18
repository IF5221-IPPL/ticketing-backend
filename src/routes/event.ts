// In routes/event.ts

import express from 'express';
import { createEvent, readEvents, findEventById, updateEventById, deleteEventById } from '../handler/event';
import { validateEventData, validateEventUpdateData } from '../middleware/event';

const router = express.Router();

router.post('/event', validateEventData, createEvent);
router.get('/events', readEvents);
router.get('/event/:eventId', findEventById);
router.put('/event/:eventId', validateEventUpdateData,updateEventById); 
router.delete('/event/:eventId', deleteEventById); 

export default router;
