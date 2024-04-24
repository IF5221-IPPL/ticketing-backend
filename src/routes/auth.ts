import { Router } from "express";
import * as registerHandler from "handler/register";
import * as registerAdminHandler from "handler/register_admin";
import * as registerEventOrganizerHandler from "handler/register_eo";
import * as loginHandler from "handler/login";
import { auth } from "middleware/auth";
import { checkRole } from "middleware/check_role";

export default () => {
	const router = Router();

	router.post("/register", registerHandler.register);
	router.post("/register/admin", auth, checkRole("admin"), registerAdminHandler.register);
	router.post("/register/eo", registerEventOrganizerHandler.register);
	router.post("/login", loginHandler.login);

	return router;
};
