import { StatusCodes } from "http-status-codes";

import * as FileUsecase from "usecase/file/";

import { IFileMulter } from "entity/file/";
import { sendResponse } from "pkg/http/";

interface IReqFile extends Request {
	file: IFileMulter;
}

export const uploadSingleFile = async (req: IReqFile, res: Response) => {
	try {
		console.log("MASUK SINI");
		console.log(req.file);
		const file = await FileUsecase.CreateFile(req.file);

		console.log("INI FILE");
		console.log(file);

		sendResponse(res, StatusCodes.CREATED, "File successfully uploaded", {
			file,
		});
	} catch (err) {
		sendResponse(res, StatusCodes.BAD_REQUEST, err?.message, err);
	}
};
