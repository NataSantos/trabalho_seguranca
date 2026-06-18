/**
 * CONFIG - Database (SQLite)
 * 
 * PROTEÇÃO SQL INJECTION:
 * O driver better-sqlite3 utiliza prepared statements por padrão.
 * Todas as consultas são parametrizadas com placeholders (?),
 * garantindo que dados do usuário nunca sejam interpretados como SQL.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.resolve(__dirname, '..', '..', 'data');
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'curriculos.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const schemaPath = path.resolve(__dirname, '..', 'db', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.exec(schema);

module.exports = db;
