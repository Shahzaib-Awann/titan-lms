import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

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
 * Validates required database configuration.
 */
if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_NAME) {
  throw new Error(
    "Database configuration missing. Required variables: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME"
  );
}

/**
 * Configures MySQL connection pool settings.
 */
const poolConfig: mysql.PoolOptions = {
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  port: Number(DB_PORT),
  database: DB_NAME,

  // Connection management
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,

  // Performance & stability
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
};

/**
 * Creates MySQL connection pool.
 */
export const pool = mysql.createPool(poolConfig);

/**
 * Initializes Drizzle ORM database instance.
 */
export const db = drizzle(pool, {
  schema,
  mode: "default",
});