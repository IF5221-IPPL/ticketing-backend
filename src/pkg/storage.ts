import multerS3 from "multer-s3";
import AWS from "aws-sdk";

require("dotenv").config();

const s3 = new AWS.S3({
	endpoint: process.env.S3_ENDPOINT,
	accessKeyId: process.env.S3_ACCESS_KEY_ID,
	secretAccessKey: process.env.S3_ACCESS_SECRET_KEY,
	sslEnabled: false,
	s3ForcePathStyle: true,
});

const storage = multerS3({
	s3,
	bucket: process.env.S3_BUCKET,
	contentType: multerS3.AUTO_CONTENT_TYPE,
	metadata: (req, file, cb) => {
		cb(null, { fieldName: file.fieldname });
	},
	key: (req, file, cb) => {
		cb(null, Date.now().toString());
	},
});

export default storage;
