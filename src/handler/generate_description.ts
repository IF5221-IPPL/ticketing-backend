import { IGptRequest } from "entity/gpt/";
import OpenAI from "openai";
import { Request, Response } from "express";
import Joi from "joi";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import { Logger } from "pkg/logger/";

export const generateDescByGPT = async (req: Request, res: Response) => {
  const openai = new OpenAI({ apiKey: `${process.env.GPT_API_KEY}` });
  const gptReq: IGptRequest = req.body;
  const { error, value } = gptRequestSchema.validate(gptReq);
  let messagesPayload: any= {};
  if (error) {
    return sendResponse(
      res,
      StatusCodes.BAD_REQUEST,
      error.details[0].message,
      null
    );
  }
 
 messagesPayload.role = "system";
 messagesPayload.content = value.text;
  try {
    const completion = await openai.chat.completions.create({
      messages: [messagesPayload],
      model: "gpt-3.5-turbo",
    });

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

// Validation schema
const gptRequestSchema = Joi.object({
  userId: Joi.string().required(),
  text: Joi.string().required(),
});
