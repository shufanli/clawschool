import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const dataDir = path.join(process.cwd(), "data");
const DB_PATH = path.join(dataDir, "clawschool.db");

let db: Database.Database;

function getDb(): Database.Database {
  if (!db) {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    initDb(db);
  }
  return db;
}

function initDb(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS lobsters (
      token TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      ref_token TEXT,
      status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      scores TEXT NOT NULL,
      total_score INTEGER NOT NULL,
      speed_bonus INTEGER DEFAULT 0,
      skill_bonus INTEGER DEFAULT 0,
      iq_score INTEGER NOT NULL,
      title TEXT NOT NULL,
      badge TEXT NOT NULL,
      percentile REAL DEFAULT 0,
      duration_seconds INTEGER DEFAULT 0,
      model TEXT DEFAULT '',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (token) REFERENCES lobsters(token)
    );

    CREATE TABLE IF NOT EXISTS upgrades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      token TEXT NOT NULL,
      task_id TEXT UNIQUE NOT NULL,
      selected_qids TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      completed_at TEXT,
      FOREIGN KEY (token) REFERENCES lobsters(token)
    );

    CREATE TABLE IF NOT EXISTS referrals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sharer_token TEXT NOT NULL,
      friend_token TEXT NOT NULL,
      friend_completed INTEGER DEFAULT 0,
      reward_claimed INTEGER DEFAULT 0,
      reward_qid TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_results_token ON test_results(token);
    CREATE INDEX IF NOT EXISTS idx_results_iq ON test_results(iq_score DESC);
  `);
}

export default getDb;
