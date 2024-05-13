import { Request, Response } from "express";
import { Logger } from "pkg/logger/";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import CONSTANT from "entity/const/";
import EventOrganizer from "model/event_organizer/";
import User from "model/user/";


export const viewAccounts = async (req: Request, res: Response) => {
     
    try {
      const customers = await User.find().lean();
      const eventOrganizer = await EventOrganizer.find().lean();
      
      const accounts = (customers as any[]).concat(eventOrganizer as any[]);

      sendResponse(
        res,
        StatusCodes.OK,
        "",
        {
            accounts:accounts
        }
      );
    } catch (error) {
    //   logError(req, res, "Error fetching events", error);
      sendResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Internal Server Error",
        null
      );
    }
  };