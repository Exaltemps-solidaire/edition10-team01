import pg from "pg";

export const pool = new pg.Pool({
  host: process.env.DB_HOST ?? "localhost",
  database: process.env.DB_NAME ?? "team01",
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "postgres",
  port: Number(process.env.DB_PORT ?? 5432),
});
