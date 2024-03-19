import { IHealthCheck } from "entity/health/";
import { StatusCodes } from "http-status-codes";

import { sendResponse } from "pkg/http/";
import { Logger }  from "pkg/logger/";

export const healthCheck = (req: Request, res: Response) => {
	try {
		const response: IHealthCheck = {
			backend: true,
		};

		// Logger.info({
  		// 	message: 'User login attempt',
		// })


		sendResponse(res, StatusCodes.OK, "Server is up and running", response);
	} catch (err) {
		sendResponse(res, err.code, err.message, err.data);
	}
};
