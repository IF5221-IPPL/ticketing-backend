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

   // Function to update an event by ID
export const updateEventById = async (req: Request, res: Response) => {
    const eventId = req.params.eventId;
    const updateData = req.body; // New data to update the event

    try {
        // Find the event by ID and update it with the new data
        const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true });

        if (!updatedEvent) {
            return res.status(404).json({ message: 'Event not found' });
        }

        res.json(updatedEvent); // Respond with the updated event
    } catch (error) {
        console.error('Error updating event by ID:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
 
