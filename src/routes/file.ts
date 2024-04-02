import { Router } from "express";

import { singleUpload } from "middleware/upload/";

import * as fileHandler from "handler/file";

export default () => {
	const router = Router();

	router.post("/file", singleUpload, fileHandler.uploadSingleFile);

	return router;
};
