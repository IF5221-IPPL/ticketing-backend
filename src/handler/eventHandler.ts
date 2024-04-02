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
