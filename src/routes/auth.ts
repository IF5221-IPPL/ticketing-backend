import { Router } from "express";
import * as registerHandler from "handler/register";

export default () => {
	const router = Router();

	router.post("/register", registerHandler.register);

	return router;
};
