// In routes/event.ts

import express from 'express';
import { createEvent } from '../handler/eventHandler';
import { validateEventData } from '../middleware/eventMiddleware'; // Import your event-specific middleware

const router = express.Router();

router.post('/event', validateEventData, createEvent);

export default router;
