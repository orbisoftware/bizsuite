import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { nanoid } from 'nanoid';

let connection: Database.Database | null = null;
let orm: ReturnType<typeof drizzle> | null = null;

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  passwordHash: text('password_hash').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const addonsTable = sqliteTable('addons', {
  id: text('id').primaryKey(),
  key: text('key').notNull().unique(),
  name: text('name').notNull(),
  version: text('version').notNull(),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  installedAt: integer('installed_at', { mode: 'timestamp' }),
});

export type Db = NonNullable<typeof orm>;

export function getDb(): Db {
  if (orm) return orm;
  const dbFile = process.env.DATABASE_URL || 'bizzly.sqlite';
  connection = new Database(dbFile);
  orm = drizzle(connection);
  // naive schema init
  connection.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS addons (
      id TEXT PRIMARY KEY,
      key TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      version TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 0,
      installed_at INTEGER
    );
  `);
  return orm;
}

export function seedDevAdminIfEmpty() {
  if (!connection) return;
  const exists = connection.prepare('SELECT COUNT(1) as c FROM users').get() as { c: number };
  if (exists.c === 0) {
    const id = nanoid();
    connection
      .prepare(
        'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)' 
      )
      .run(id, 'admin@example.com', 'Admin', 'dev-only-not-secure', Date.now());
  }
}


