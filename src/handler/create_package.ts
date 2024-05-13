import { Request, Response } from "express";
import { Event } from "model/event";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";
import Joi from "joi";
import { Logger } from "pkg/logger/";
import { ICreatePackageRequest, IPackageResponse } from '../entity/create_package';
import Package from "model/package";

const createPackageSchema = Joi.object({
  name: Joi.string().required().description("Package name"),
  description: Joi.string().required().description("Package description"),
  totalToken: Joi.number().required().description("Total token"),
  price: Joi.number().required().description("Price"),
});

export const createPackage = async (req: Request, res: Response) => {
  let createPackageReq: ICreatePackageRequest | null = null;
  let createPackageRes: IPackageResponse | null = null;

  try {
    const { error } = createPackageSchema.validate(req.body);
    if (error) {
      return sendResponse(res, StatusCodes.BAD_REQUEST, error.details[0].message, "");
    }

    createPackageReq = req.body;

    const newPackage = await Package.create({
      name: createPackageReq.name,
      description: createPackageReq.description,
      totalToken: createPackageReq.totalToken,
      price: createPackageReq.price,
    });

    createPackageRes = {
      _id: newPackage._id,
      name: newPackage.name,
      description: newPackage.description,
      totalToken: newPackage.totalToken,
      price: newPackage.price,
      createdAt: newPackage.createdAt.toISOString(),
      updatedAt: newPackage.updatedAt?.toISOString(),
    }

    sendResponse(res, StatusCodes.OK, "Create package success", createPackageRes);
  } catch (err) {
    Logger.error(
      {
        message: "Failed to create package",
        request: createPackageReq,
        response: createPackageRes,
        error: { 
          message: err.message, 
          stack: err.stack 
        },
      }
    )
      sendResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, "Something went wrong", "");
  }
};

