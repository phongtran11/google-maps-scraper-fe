import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dbCredentials: {
    url: process.env.NEON_DATABASE_URL!,
  },
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./app/server/database/schema.server.ts",
});
