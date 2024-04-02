import express, { Application, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

import { isProduction } from "pkg/envs/";
import CONSTANT from "entity/const";

import routes from "routes";
import { sendResponse } from "pkg/http/";
import { StatusCodes } from "http-status-codes";

import morganMiddleware from "../middleware/morgan";

require("dotenv").config();

export default (app: Application) => {
	const corsOption = {
		credentials: true,
		origin: isProduction() ? CONSTANT.CORS_ORIGIN.PRODUCTION : CONSTANT.CORS_ORIGIN.DEVELOPMENT,
		method: ["GET", "PUT", "POST", "DELETE"],
	};

	app.use(morganMiddleware);
	app.use(bodyParser.json({ limit: process.env.MAX_REQUEST_SIZE }));
	app.enable("trust-proxy");
	app.use(cors(corsOption));
	app.use(cookieParser());

	app.use(process.env.PREFIX_API, routes.HealthRoutes());
	app.use(process.env.PREFIX_API, "/auth", routes.AuthRoutes());

	app.use((_: Request, res: Response) => {
		return sendResponse(res, StatusCodes.NOT_FOUND, "Not Found", {});
	});
};
