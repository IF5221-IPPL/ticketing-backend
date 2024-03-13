import CONSTANT from "entity/const";

export const isProduction = (): boolean => {
	return process.env.NODE_ENV === CONSTANT.PROD_TAG;
};
