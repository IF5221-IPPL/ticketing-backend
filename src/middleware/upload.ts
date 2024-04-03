require("dotenv").config();

import multer from "multer";
import { createProxyMiddleware } from "http-proxy-middleware";

import storage from "pkg/storage/";

export const singleUpload = multer({ storage }).single("file");

export const minioProxy = createProxyMiddleware({
	target: `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}`, // Target MinIO server URL
	changeOrigin: true, // Change the origin of the host header to the target URL
});
