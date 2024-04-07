export interface IFileMulter {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	size: number;
	bucket: string;
	key: string;
	acl: string;
	contentType: string;
	contentDisposition: any;
	contentEncoding: any;
	storageClass: string;
	serverSideEncryption: any;
	metadata: IFileMetadataMulter;
	location: string;
	etag: string;
}

export interface IFileMetadataMulter {
	fieldName: string;
}
