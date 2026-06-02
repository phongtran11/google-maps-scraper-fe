/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { AsyncLocalStorage } from "node:async_hooks";

import * as schema from "./schema.server";

const WRAPPED_SYMBOL = Symbol.for("query_wrapped");
const queryStorage = new AsyncLocalStorage<{ inPoolQuery?: boolean }>();

class DB {
  public pool: Pool;

  private logColor = {
    ERROR: "\x1b[31m",
    MS: "\x1b[35m",
    PARAMS: "\x1b[90m",
    QUERY: "\x1b[32m",
    RESET: "\x1b[0m",
    TAG: "\x1b[36m[DB]\x1b[0m",
    TIMESTAMP: "\x1b[90m",
  };

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });

    const originalConnect = this.pool.connect.bind(this.pool);

    this.pool.connect = async (...args: any[]) => {
      const client = await (originalConnect as any)(...args);
      if (client && !client[WRAPPED_SYMBOL]) {
        client[WRAPPED_SYMBOL] = true;
        client.query = this.wrapQuery(client.query.bind(client), false);
      }
      return client;
    };

    this.pool.query = this.wrapQuery(this.pool.query.bind(this.pool), true);
  }

  init() {
    return drizzle(this.pool, {
      schema,
    });
  }

  private wrapQuery(originalQuery: Function, isPool: boolean) {
    return async (...args: any[]) => {
      const store = queryStorage.getStore();
      if (!isPool && store?.inPoolQuery) {
        return originalQuery(...args);
      }

      const start = performance.now();
      const queryText = typeof args[0] === "string" ? args[0] : args[0]?.text;
      const params = args[1];
      const executeQuery = () => originalQuery(...args);

      try {
        const result = isPool
          ? await queryStorage.run({ inPoolQuery: true }, executeQuery)
          : await executeQuery();
        const duration = performance.now() - start;
        const timestamp = new Date().toISOString();
        console.log(
          `${this.logColor.TAG} ${this.logColor.TIMESTAMP}${timestamp}${this.logColor.RESET} ${this.logColor.QUERY}${queryText}${this.logColor.RESET} ${this.logColor.MS}(${duration.toFixed(2)}ms)${this.logColor.RESET}`,
        );
        if (params && params.length > 0) {
          console.log(
            `  ${this.logColor.PARAMS}↳ Params: ${JSON.stringify(params)}${this.logColor.RESET}`,
          );
        }
        return result;
      } catch (error: any) {
        const duration = performance.now() - start;
        const timestamp = new Date().toISOString();
        console.error(
          `${this.logColor.TAG} ${this.logColor.TIMESTAMP}${timestamp}${this.logColor.RESET} ${this.logColor.ERROR}${error.message}${this.logColor.RESET} ${this.logColor.QUERY}${queryText}${this.logColor.RESET} ${this.logColor.MS}(${duration.toFixed(2)}ms)${this.logColor.RESET}`,
        );
        throw error;
      }
    };
  }
}

const dbInstance = new DB();
export const db = dbInstance.init();
export const pool = dbInstance.pool;
