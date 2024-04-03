import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
	key: {
		type: String,
		required: true,
		unique: true,
	},
	name: {
		type: String,
	},
	url: {
		type: String,
	},
	mimetype: {
		type: String,
	},
	size: {
		type: Number,
	},
});

const FileModel = mongoose.model("File", FileSchema);

export default FileModel;
