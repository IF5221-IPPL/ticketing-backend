import { createLogger, format, transports } from 'winston';
import CONSTANT from "entity/const";

// Custom typing for the log information
interface LogInfo {
  level: string;
  message?: string;
  label?: string;
  request?: any;
  response?: any;
  timestamp?: string;
}

// Custom format
const customFormat = format.printf((info: LogInfo) => {
  // The timestamp is automatically included in the info object by format.timestamp()
  console.log(info)
  const log = {
    level: info.level,
    timestamp: info.timestamp, // This will be in RFC 3339 format
    label: process.env.NODE_ENV || "development",
    message: info.message,
    request: info.request,
    response: info.response,
  };
  return JSON.stringify(log);
});

// Create the logger
const Logger = createLogger({
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ssZ' }), // RFC 3339 / ISO 8601 format
        customFormat
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: process.env.LOG_FILE_PATH || CONSTANT.DEFAULT_LOG_FILE_PATH }),  
    ],
});

export { Logger }