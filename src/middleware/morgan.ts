import morgan, { StreamOptions } from "morgan";
import fs from "fs";
import path from 'path';
import CONSTANT from "entity/const";

const logDirectory = path.resolve(process.cwd(), process.env.ACCESS_LOG_FILE_PATH || CONSTANT.DEFAULT_ACCCESS_LOG_FILE_PATH);

const accessLogStream = fs.createWriteStream(logDirectory, { flags: 'a' });

const stream: StreamOptions = {
    write: (message) => { 
        console.log(message),
        accessLogStream.write(message + '\n');
    }
};

// Custom Morgan token format in JSON
const jsonFormat = (tokens, req, res) => {
  const log = {
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: tokens.status(req, res),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTime: tokens['response-time'](req, res) + ' ms'
  };
  return JSON.stringify(log);
};

const morganMiddleware = morgan(jsonFormat, { stream });

export default morganMiddleware;
