import postgres, { type Sql } from "postgres";

export type DbRow = Record<string, unknown>;

export interface DbClient {
  query<T extends DbRow = DbRow>(text: string, values?: unknown[]): Promise<T[]>;
  execute<T extends DbRow = DbRow>(text: string, values?: unknown[]): Promise<T[]>;
}

const databaseUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

function createSql() {
  if (!databaseUrl) throw new Error("DATABASE_URL atau POSTGRES_URL wajib diisi dengan pooled connection string Neon.");
  return postgres(databaseUrl, {
    max: 1,
    prepare: false,
    ssl: /(?:localhost|127\.0\.0\.1)/.test(databaseUrl) ? false : "require",
    idle_timeout: 20,
    connect_timeout: 10,
    transform: { undefined: null },
  });
}

const globalForDb = globalThis as unknown as { fungsiverseSql?: Sql };
const sql = globalForDb.fungsiverseSql ?? createSql();
if (process.env.NODE_ENV !== "production") globalForDb.fungsiverseSql = sql;

function postgresPlaceholders(text: string) {
  let index = 0;
  return text.replace(/\?/g, () => `$${++index}`);
}

function adapter(client: Sql): DbClient {
  const query = async <T extends DbRow = DbRow>(text: string, values: unknown[] = []) => {
    const result = await client.unsafe(postgresPlaceholders(text), values as never[]);
    return [...result] as unknown as T[];
  };
  return { query, execute: query };
}

export const db = adapter(sql);

export async function rows<T extends DbRow[]>(text: string, values: unknown[] = []) {
  return db.query<T[number]>(text, values) as Promise<T>;
}

export async function transaction<T>(fn: (connection: DbClient) => Promise<T>) {
  return sql.begin(async (connection) => fn(adapter(connection as unknown as Sql))) as Promise<T>;
}
