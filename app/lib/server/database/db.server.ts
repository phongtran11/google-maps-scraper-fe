import { Pool, neon } from "@neondatabase/serverless";

export const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

const sqlRaw = neon(process.env.NEON_DATABASE_URL!);

async function logQuery<T>(
  label: string,
  queryText: string,
  params: any[] | undefined,
  executor: () => Promise<T>,
): Promise<T> {
  const start = performance.now();
  try {
    const result = await executor();
    const duration = (performance.now() - start).toFixed(2);
    if (process.env.NODE_ENV === "development") {
      console.log(
        `[${label}] Query: ${queryText.trim()} | Params: ${JSON.stringify(params)} | Time: ${duration}ms`,
      );
    }
    return result;
  } catch (err) {
    const duration = (performance.now() - start).toFixed(2);
    console.error(
      `❌ [${label}] Error: ${err instanceof Error ? err.message : String(err)} | Query: ${queryText.trim()} | Params: ${JSON.stringify(params)} | Time: ${duration}ms`,
    );
    throw err;
  }
}

const originalPoolQuery = pool.query.bind(pool);
pool.query = async function (queryText: any, values?: any, cb?: any) {
  let logText = "";
  let logParams: any[] | undefined = undefined;

  if (typeof queryText === "string") {
    logText = queryText;
    if (Array.isArray(values)) {
      logParams = values;
    } else if (typeof values === "function") {
      cb = values;
    }
  } else if (queryText && typeof queryText === "object") {
    logText = queryText.text || "";
    if (Array.isArray(queryText.values)) {
      logParams = queryText.values;
    } else if (Array.isArray(values)) {
      logParams = values;
    }
  }

  if (typeof cb === "function") {
    const start = performance.now();
    return originalPoolQuery(queryText, values, (err: any, result: any) => {
      const duration = (performance.now() - start).toFixed(2);
      if (err) {
        console.error(
          `❌ [Pool] Error: ${err.message} | Query: ${logText.trim()} | Params: ${JSON.stringify(logParams)} | Time: ${duration}ms`,
        );
      } else {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `[Pool] Query: ${logText.trim()} | Params: ${JSON.stringify(logParams)} | Time: ${duration}ms`,
          );
        }
      }
      cb(err, result);
    });
  }

  return logQuery("Pool", logText || String(queryText), logParams, () =>
    originalPoolQuery(queryText, values),
  );
} as any;

export interface SqlQueryClient {
  (strings: TemplateStringsArray, ...values: any[]): Promise<any>;
  query(queryText: string, params?: any[]): Promise<any>;
}

const sqlWrapper = async function (
  strings: TemplateStringsArray,
  ...values: any[]
) {
  let queryText = "";
  if (Array.isArray(strings)) {
    queryText = strings.reduce(
      (acc, str, i) => acc + str + (i < values.length ? `$${i + 1}` : ""),
      "",
    );
  } else {
    queryText = String(strings);
  }

  return logQuery("SQL", queryText, values, () => sqlRaw(strings, ...values));
} as any;

sqlWrapper.query = async function (queryText: string, params?: any[]) {
  return logQuery("SQL", queryText, params, () =>
    sqlRaw.query(queryText, params),
  );
};

export const sql: SqlQueryClient = sqlWrapper;
