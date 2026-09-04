const config = {
    port: Number(process.env.PORT),
    jwtSecret: process.env.JWT_SECRET,
    bankCode: process.env.BANK_CODE,
    bankName: process.env.BANK_NAME,
    nibssBaseUrl: process.env.NIBSS_BASE_URL,
    nibssApiKey: process.env.NIBSS_API_KEY,
    nibssApiSecret: process.env.NIBSS_API_SECRET,
    mongodbUri: process.env.MONGODB_URI
};

if (!config.port) {
    throw new Error("missing or invalid port number");
} else if (!config.mongodbUri) {
    throw new Error("missing MONGODB_URI");
}

if (!config.jwtSecret) {
    throw new Error("missing JWT_SECRET");
} else if (config.jwtSecret.length < 32) {
    throw new Error("secret must be at least 32 char long");
}

if (!config.nibssApiKey) {
    throw new Error("missing NIBSS_API_KEY");
} else if (!config.nibssApiSecret) {
    throw new Error("missing NIBSS_API_SECRET");
}

export default config;
