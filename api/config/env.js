const config = {
    port: Number(process.env.PORT),
    jwtSecret: process.env.JWT_SECRET,
    bankCode: process.env.BANK_CODE,
    bankName: process.env.BANK_NAME,
    nibssCredentials: {
        nibssBaseUrl: process.env.NIBSS_BASE_URL
        nibssApiKey: process.env.NIBSS_API_KEY,
        nibssApiSecret: process.env.NIBSS_API_SECRET
    }
};

if (!config.port) {
    throw new Error("missing or invalid port number");
}

if (!config.jwtSecret) {
    throw new Error("missing JWT_SECRET");
} else if (config.jwtSecret.length < 32) {
    throw new Error("secret must be at least 32 char long");
}

if (!config.nibssCredentials) {
    throw new Error("missing NIBSS credentials");       } else if (!config.nibssCredentials.nibssApiKey) {
    throw new Error("missing NIBSS_API_KEY");
} else if (!config.nibssCredentials.nibssApiSecret) {
    throw new Error("missing NIBSS_API_SECRET");
} else if (!config.nibssCredentials.nibssBaseUrl) {         throw new Error("missing NIBSS_BASE_URL");
}

export default config;
