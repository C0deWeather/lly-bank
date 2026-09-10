import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        environment: 'node',
        hookTimeout: 30000,
        env: {
            ADMIN_EMAIL: 'admin@llybank.com'
        }
    }
});
