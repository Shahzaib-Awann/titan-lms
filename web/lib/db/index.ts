import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const {
  DB_USER,
  DB_PASSWORD,
  DB_HOST,
  DB_PORT,
  DB_NAME,
} = process.env;

if (!DB_USER || !DB_PASSWORD || !DB_HOST || !DB_PORT || !DB_NAME) {
  throw new Error(
    "Database configuration missing. Required variables: DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME"
  );
}

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
 * MySQL connection pool
 */
export const pool = mysql.createPool(poolConfig);

/**
 * Drizzle ORM instance
 */
export const db = drizzle(pool, {
  schema,
  mode: "default",
});