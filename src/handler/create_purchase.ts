import { Request, Response } from "express";
import { Event } from "model/event";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { Logger } from "pkg/logger/";
import { ICreatePurchaseRequest, IPurchaseResponse } from '../entity/create_purchase';
import Package from "model/package";
import Purchase from "model/purchase";
import EventOrganizer from "model/event_organizer/";

const createPurchaseSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  packageId: Joi.string().hex().length(24).required(),
});

export const createPurchase = async (req: Request, res: Response) => {
  let createPurchaseReq: ICreatePurchaseRequest | null = null;
  let createPurchaseRes: IPurchaseResponse | null = null;

  try {
    const { error } = createPurchaseSchema.validate(req.body);
    if (error) {
      return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
    }

    createPurchaseReq = req.body;

    const packageToBuy = await Package.findById(createPurchaseReq.packageId);
    if (!packageToBuy) {
      return sendResponse(res, StatusCodes.NOT_FOUND, "Package not found", "");
    }

    const newPurchase = await Purchase.create({
      userId: createPurchaseReq.userId,
      packageId: createPurchaseReq.packageId,
      packageName: packageToBuy.name,
      totalToken: packageToBuy.totalToken,
    });

    await EventOrganizer.findOneAndUpdate({ userId: createPurchaseReq.userId }, {
      $inc: { gptAccessTokenQuota: packageToBuy.totalToken },
    });

    createPurchaseRes = {
      _id: newPurchase._id,
      userId: newPurchase.userId,
      packageId: newPurchase.packageId,
      packageName: newPurchase.packageName,
      totalToken: newPurchase.totalToken,
      createdAt: newPurchase.createdAt.toISOString(),
      updatedAt: newPurchase.updatedAt?.toISOString(),
    }

    sendResponse(res, StatusCodes.OK, "Create purchase success", createPurchaseRes);
  } catch (err) {
    Logger.error(
      {
        message: "Failed to create purchase",
        request: createPurchaseReq,
        response: createPurchaseRes,
        error: { 
          message: err.message, 
          stack: err.stack 
        },
      }
    )
      sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
  }
};

