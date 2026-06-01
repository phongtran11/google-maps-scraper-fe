import { Pool, type PoolClient } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema.server";

function wrapQuery(originalQuery: Function) {
  return async function (this: any, ...args: any[]) {
    const start = performance.now();
    const queryText = typeof args[0] === "string" ? args[0] : args[0]?.text;
    const params = typeof args[0] === "string" ? args[1] : args[0]?.values;

    try {
      const result = await originalQuery.apply(this, args);
      const duration = performance.now() - start;
      const timestamp = new Date().toISOString();
      console.log(
        `\x1b[36m[DB]\x1b[0m \x1b[90m${timestamp}\x1b[0m \x1b[32m${queryText}\x1b[0m \x1b[35m(${duration.toFixed(2)}ms)\x1b[0m`,
      );
      if (params && params.length > 0) {
        console.log(`  \x1b[90m↳ Params: ${JSON.stringify(params)}\x1b[0m`);
      }
      return result;
    } catch (error: any) {
      const duration = performance.now() - start;
      const timestamp = new Date().toISOString();
      console.error(
        `\x1b[31m[DB ERROR]\x1b[0m \x1b[90m${timestamp}\x1b[0m \x1b[31m${error.message}\x1b[0m \x1b[32m${queryText}\x1b[0m \x1b[35m(${duration.toFixed(2)}ms)\x1b[0m`,
      );
      throw error;
    }
  };
}

export const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

pool.query = wrapQuery(pool.query.bind(pool)) as any;

const originalConnect = pool.connect.bind(pool);
const WRAPPED_SYMBOL = Symbol.for("query_wrapped");

pool.connect = async function (this: any, ...args: any[]) {
  const client = (await (originalConnect as any).apply(this, args)) as PoolClient;
  if (client && !(client as any)[WRAPPED_SYMBOL]) {
    (client as any)[WRAPPED_SYMBOL] = true;
    client.query = wrapQuery(client.query.bind(client)) as any;
  }
  return client;
} as any;

export const db = drizzle(pool, {
  schema,
  logger: false,
});
