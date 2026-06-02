/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { AsyncLocalStorage } from "node:async_hooks";

import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";

import * as schema from "./schema.server";

const WRAPPED_SYMBOL = Symbol.for("query_wrapped");
const queryStorage = new AsyncLocalStorage<{ inPoolQuery?: boolean }>();

class DB {
  public pool: Pool;

  private logColor = {
    TAG: "\x1b[36m[DB]\x1b[0m",
    TIMESTAMP: "\x1b[90m",
    QUERY: "\x1b[32m",
    MS: "\x1b[35m",
    PARAMS: "\x1b[90m",
    ERROR: "\x1b[31m",
    RESET: "\x1b[0m",
  };

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.NEON_DATABASE_URL,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    const originalConnect = this.pool.connect.bind(this.pool);

    this.pool.connect = (async (...args: any[]) => {
      const client = await (originalConnect as any)(...args);
      if (client && !(client as any)[WRAPPED_SYMBOL]) {
        (client as any)[WRAPPED_SYMBOL] = true;
        client.query = this.wrapQuery(client.query.bind(client), false);
      }
      return client;
    }) as any;

    this.pool.query = this.wrapQuery(this.pool.query.bind(this.pool), true);
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

  init() {
    return drizzle(this.pool, {
      schema,
    });
  }
}

const dbInstance = new DB();
export const db = dbInstance.init();
export const pool = dbInstance.pool;
