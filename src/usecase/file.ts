import { IFileMulter } from "entity/file/";
import FileModel from "model/file/";

export const CreateFile = async (inputFile: IFileMulter) => {
	const file = new FileModel({
		key: inputFile.key,
		name: inputFile.originalname,
		mimetype: inputFile.mimetype,
		size: inputFile.size,
		url: `/public/${inputFile.key}`,
	});

	const res = await file.save();

	return res;
};
