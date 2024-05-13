import express, { Application, Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { isProduction } from "pkg/envs/";
import CONSTANT from "entity/const";

import routes from "routes";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";

import morganMiddleware from "../middleware/morgan";

import eventRoutes from 'routes/event'; 
import generate_description_routes from 'routes/generate_description';
import ticketRoute from 'routes/ticket/';
import { minioProxy } from "middleware/upload/";

require("dotenv").config();

export default (app: Application) => {
    const corsOption = {
        credentials: true,
        origin: isProduction() ? CONSTANT.CORS_ORIGIN.PRODUCTION : CONSTANT.CORS_ORIGIN.DEVELOPMENT,
        method: ["GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
    };

	app.use("/public", minioProxy);
    app.use(morganMiddleware);
    app.use(bodyParser.json({ limit: process.env.MAX_REQUEST_SIZE }));
    app.enable("trust-proxy");
    app.use(cors(corsOption));
    app.use(cookieParser());

	app.use(process.env.PREFIX_API, routes.HealthRoutes());
	app.use(`${process.env.PREFIX_API}/auth`, routes.AuthRoutes());
    app.use(process.env.PREFIX_API, eventRoutes); 
	app.use(process.env.PREFIX_API, routes.FileRoutes());
    app.use(process.env.PREFIX_API, generate_description_routes);
    app.use(process.env.PREFIX_API, ticketRoute );

    app.use((_: Request, res: Response) => {
        return sendResponse(res, StatusCodes.NOT_FOUND, "Not Found", {});
    });
};
