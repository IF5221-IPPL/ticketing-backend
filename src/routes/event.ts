// In routes/event.ts

import express from 'express';
import { createEvent, readEvents, findEventById, updateEventById } from '../handler/eventHandler';
import { validateEventData } from '../middleware/eventMiddleware'; // Import your event-specific middleware

const router = express.Router();

router.post('/event', validateEventData, createEvent);
router.get('/events', readEvents);
router.get('/event/:eventId', findEventById);
router.put('/event/:eventId', updateEventById); 

export default router;
