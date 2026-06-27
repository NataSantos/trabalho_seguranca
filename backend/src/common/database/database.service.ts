import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { mkdirSync } from 'node:fs';
import { resolveDatabaseDirectory, resolveDatabasePath } from './database-path';
import { schema } from './schema';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT NOT NULL,
  website TEXT,
  experience TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT,
  email_verified INTEGER DEFAULT 0,
  email_verification_code TEXT,
  reset_password_code TEXT,
  reset_password_expires INTEGER,
  two_factor_secret TEXT,
  two_factor_enabled INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rate_limits (
  ip_address TEXT PRIMARY KEY,
  request_count INTEGER NOT NULL DEFAULT 0,
  window_started_at INTEGER NOT NULL,
  window_expires_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
`;

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly sqlite: Database.Database;
  private readonly db: ReturnType<typeof drizzle>;

  constructor(configService: ConfigService) {
    const dbPath = resolveDatabasePath(
      process.cwd(),
      configService.get<string>('DB_DIR'),
      configService.get<string>('DB_FILE'),
    );
    mkdirSync(resolveDatabaseDirectory(dbPath), { recursive: true });
    this.sqlite = new Database(dbPath);
    this.sqlite.pragma('journal_mode = WAL');
    this.sqlite.pragma('foreign_keys = ON');
    this.db = drizzle(this.sqlite, { schema });
  }

  onModuleInit() {
    this.sqlite.exec(SCHEMA_SQL);
  }

  onModuleDestroy() {
    this.sqlite.close();
  }

  get connection() {
    return this.db;
  }
}
