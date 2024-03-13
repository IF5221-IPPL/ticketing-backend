import { Router } from "express";
import * as healthHandler from "handler/health";

export default () => {
	const router = Router();

	router.get("/health", healthHandler.healthCheck);

	return router;
};
