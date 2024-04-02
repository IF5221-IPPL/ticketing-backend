// eventHandler.ts
import { Request, Response } from 'express';
import Event from 'entity/event.model'; // Import your Mongoose model

export const createEvent = async (req: Request, res: Response) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function to fetch all events
export const readEvents = async (req: Request, res: Response) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// Function to find a specific event by ID
export const findEventById = async (req: Request, res: Response) => {
    const eventId = req.params.eventId;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'event not found' });
        }
        res.json(event);
    } catch (error) {
        console.error('Error finding event by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};