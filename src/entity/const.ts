const CONSTANT = {
  DEFAULT_PORT: 5000,
  PROD_TAG: "PRODUCTION",
  CORS_ORIGIN: {
    DEVELOPMENT: ["*"],
    PRODUCTION: ["*"],
  },
  DEFAULT_LOG_FILE_PATH: "logs/all.log",
  DEFAULT_ACCCESS_LOG_FILE_PATH: "logs/access.log",
  DEFAULT_JWT_EXPIRES_IN: "1d",
	MODEL_GPT: "gpt-3.5-turbo",
	API_CALL_LIMIT: 4,
	GPT_ROLE:"system",

  ROLE:{
    EO: "eo",
    ADMIN: "admin",
    CUSTOMER: "customer",
  },

  STATUS_EVENT: {
    UPCOMING: "upcoming",
    PAST : "past",
  },

  DEFAULT_GPT_ACCESS_TOKEN_QUOTA: 0,
};

export default CONSTANT;
