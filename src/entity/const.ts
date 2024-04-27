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

  ROLE:{
    EO: "eo",
    ADMIN: "admin",
    CUSTOMER: "customer",
  },

  STATUS_EVENT: {
    UPCOMING: "upcoming",
    PAST : "past",
  }
};

export default CONSTANT;
