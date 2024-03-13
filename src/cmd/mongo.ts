import mongoose from "mongoose";
require("dotenv").config();

const db_port = process.env.DB_PORT;
const db_host = "localhost";
const db_user = process.env.DB_USERNAME;
const db_password = process.env.DB_PASSWORD;
const db_name = process.env.DB_NAME;

export default () => {
	const conn = `mongodb://${db_user}:${db_password}@${db_host}:${db_port}/${db_name}?authSource=admin`;
	return mongoose.connect(conn);
};
