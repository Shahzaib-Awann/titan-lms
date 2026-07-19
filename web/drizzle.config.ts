import { defineConfig } from "drizzle-kit";

/**
 * Loads database connection environment variables.
 */
const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

/**
 * Validates required database environment variables.
 */
if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_NAME) {
  throw new Error("Database environment variables are missing in .env.local");
}

/**
 * Builds MySQL database connection URL.
 */
const DATABASE_URL = `mysql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;

/**
 * Configures Drizzle ORM migration and schema settings.
 */
export default defineConfig({
  schema: "./lib/db/schema",
  out: "./lib/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: DATABASE_URL,
  },
});