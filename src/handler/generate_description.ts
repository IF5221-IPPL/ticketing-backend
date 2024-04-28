import { IGptRequest } from "entity/gpt/";
import OpenAI from "openai";
import { Request, Response } from "express";
import Joi from "joi";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import { Logger } from "pkg/logger/";
import CONSTANT from "entity/const/";


// In-memory store for API call limits
const userCallCounts: { [userId: string]: { count: number; resetTime: Date } } = {};

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

 
  if (!canMakeApiCall(userId)) {
    return sendResponse(
      res,
      StatusCodes.TOO_MANY_REQUESTS,
      "API call limit reached for today",
      null
    );
  }

  const messagesPayload: any = {
    role: CONSTANT.GPT_ROLE,
    content: value.text
  };

  try {
    const completion = await openai.chat.completions.create({
      messages: [messagesPayload],
      model: CONSTANT.MODEL_GPT,
    });

    incrementApiCallCount(userId);

    return sendResponse(
      res,
      StatusCodes.OK,
      "Successfully received generated description",
      { message: completion.choices[0].message.content }
    );
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Internal Server Error",
      null
    );
    Logger.error({
      message: "Failed to generate description",
      request: req,
      response: res,
      error: {
        message: error.message,
        stack: error.stack,
      },
    });
  }
};

function canMakeApiCall(userId: string): boolean {
  const user = userCallCounts[userId];
  const now = new Date();
  if (!user || user.resetTime < now) {
    // Reset or initialize the counter every day (don't care about the hour, only day)
    userCallCounts[userId] = { count: 0, resetTime: new Date(now.setDate(now.getDate() + 1)) };
    return true;
  }
  return user.count < CONSTANT.API_CALL_LIMIT;
}

function incrementApiCallCount(userId: string): void {
  userCallCounts[userId].count += 1;
}

// Validation schema
const gptRequestSchema = Joi.object({
  userId: Joi.string().required(),
  text: Joi.string().required(),
});
