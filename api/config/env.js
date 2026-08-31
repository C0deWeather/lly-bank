const config = {
    port: Number(process.env.PORT),
    jwtSecret: process.env.JWT_SECRET,
    apiSecret: process.env.API_SECRET,
    apiKey: process.env.API_KEY,
    bankCode: process.env.BANK_CODE
};

if (!config.port) {
    throw new Error("missing or invalid port number");
}

if (!config.jwtSecret) {
    throw new Error("missing JWT_SECRET");
} else if (config.jwtSecret.length < 32) {
    throw new Error("secret must be at least 32 char long");
}

if (!config.apiSecret) {
    throw new Error("missing API_SECRET");
}

if (!config.apiKey) {
    throw new Error("missing API_KEY");
}
console.log(config.port);
export default config;
