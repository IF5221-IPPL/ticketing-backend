import { IGptRequest } from "entity/gpt/";
import OpenAI from "openai";
import { Request, Response } from "express";
import Joi from "joi";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import { Logger } from "pkg/logger/";
import CONSTANT from "entity/const/";
import EventOrganizer from "model/event_organizer/";

export const generateDescByGPT = async (req: Request, res: Response) => {
  const openai = new OpenAI({ apiKey: `${process.env.GPT_API_KEY}` });
  const gptReq: IGptRequest = req.body;
  const { error, value } = gptRequestSchema.validate(gptReq);
  const userId = req.user._id;

  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }

  const messagesPayload: any = {
    role: CONSTANT.GPT_ROLE,
    content: value.text,
  };

  try {
    const user = await EventOrganizer.findOne({ userId });
    if (!user) {
      return sendResponse(res, StatusCodes.NOT_FOUND, "User not found", null);
    }

    if (user.gptAccessTokenQuota === 0) {
      return sendResponse(
        res,
        StatusCodes.TOO_MANY_REQUESTS,
        "GPT access token quota exhausted",
        null
      );
    }

    const completion = await openai.chat.completions.create({
      messages: [messagesPayload],
      model: CONSTANT.MODEL_GPT,
    });

    if (!completion) {
      return sendResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Invalid response from OpenAI API",
        null
      );
    }

    user.gptAccessTokenQuota -= 1;
    await user.save();

    return sendResponse(
      res,
      StatusCodes.OK,
      "Successfully received generated description",
      {
        generatedDescription: completion.choices[0].message.content,
        gptQuota: user.gptAccessTokenQuota,
      }
    );
  } catch (error) {
    Logger.error({
      message: "Failed to generate description",
      request: req,
      response: res,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
    return sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      error.message
    );
  }
};

// Validation schema
const gptRequestSchema = Joi.object({
  text: Joi.string().required(),
});
