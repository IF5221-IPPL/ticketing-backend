// In routes/event.ts

import express from 'express';
import { createEvent, readEvents } from '../handler/eventHandler';
import { validateEventData } from '../middleware/eventMiddleware'; // Import your event-specific middleware

const router = express.Router();

router.post('/event', validateEventData, createEvent);

// Route to fetch all events
router.get('/events', readEvents);

export default router;
