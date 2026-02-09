import { loadEnv, defineConfig } from "@medusajs/framework/utils";

loadEnv(process.env.NODE_ENV || "development", process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL || "postgres://localhost/medusa-live-sales",
    http: {
      storeCors: process.env.STORE_CORS || "http://localhost:5173,http://localhost:3000",
      adminCors: process.env.ADMIN_CORS || "http://localhost:7001",
      authCors: process.env.AUTH_CORS || "http://localhost:5173",
      jwtSecret: process.env.JWT_SECRET || "supersecret_jwt_key_for_live_sales_platform",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret_cookie_key_for_live_sales",
    },
  },
  modules: [
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "uploads",
            },
          },
        ],
      },
    },
  ],
});
