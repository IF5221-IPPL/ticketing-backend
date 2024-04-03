import { Router } from "express";
import * as registerHandler from "handler/register";
import * as loginHandler from "handler/login";
import { validateRegisterRequest } from "middleware/register/";

export default () => {
	const router = Router();

	router.post("/register", validateRegisterRequest, registerHandler.register);
	router.post("/login", loginHandler.login);

	return router;
};
