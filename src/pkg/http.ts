import { Response } from "express";

export const sendResponse = (res: Response, code: number, message: string, data: any): void => {
	const status = code >= 400 ? "ERROR" : "OK";

	res.status(code).json({
		code,
		status,
		message,
		data,
	});
};
