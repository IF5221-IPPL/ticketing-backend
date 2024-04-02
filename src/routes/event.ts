// In routes/event.ts

import express from 'express';
import { createEvent, readEvents, findEventById } from '../handler/eventHandler';
import { validateEventData } from '../middleware/eventMiddleware'; // Import your event-specific middleware

const router = express.Router();

router.post('/event', validateEventData, createEvent);
router.get('/events', readEvents);
router.get('/event/:eventId', findEventById);


export default router;
