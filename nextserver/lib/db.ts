import mysql, { type Pool, type PoolConnection, type RowDataPacket } from "mysql2/promise";
import { dbConfig } from "./env";

let pool: Pool | null = null;
let initPromise: Promise<void> | null = null;

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NULL,
    avatar_url TEXT NULL,
    google_id VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS otp_codes (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    code_hash CHAR(64) NOT NULL,
    expires_at DATETIME NOT NULL,
    used TINYINT(1) NOT NULL DEFAULT 0,
    attempts INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_otp_email (email)
  )`,
  `CREATE TABLE IF NOT EXISTS \`groups\` (
    id CHAR(36) PRIMARY KEY,
    name VARCHAR(80) NOT NULL,
    created_by CHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_groups_creator FOREIGN KEY (created_by) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS group_members (
    id CHAR(36) PRIMARY KEY,
    group_id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    user_id CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_group_email (group_id, email),
    INDEX idx_member_email (email),
    CONSTRAINT fk_members_group FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE,
    CONSTRAINT fk_members_user FOREIGN KEY (user_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS friendships (
    id CHAR(36) PRIMARY KEY,
    user_email VARCHAR(255) NOT NULL,
    friend_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_friend (user_email, friend_email)
  )`,
  `CREATE TABLE IF NOT EXISTS expenses (
    id CHAR(36) PRIMARY KEY,
    group_id CHAR(36) NULL,
    description VARCHAR(140) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    paid_by_email VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expense_group (group_id),
    INDEX idx_expense_payer (paid_by_email),
    CONSTRAINT fk_expense_group FOREIGN KEY (group_id) REFERENCES \`groups\`(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS expense_shares (
    id CHAR(36) PRIMARY KEY,
    expense_id CHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    INDEX idx_share_email (email),
    CONSTRAINT fk_share_expense FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE
  )`,
];

async function initialize() {
  const config = dbConfig();
  if (!config.user) throw new Error("Set DB_USER and DB_PASS in nextserver/.env");

  const bootstrap = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
  });
  await bootstrap.query(
    `CREATE DATABASE IF NOT EXISTS \`${config.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await bootstrap.end();

  pool = mysql.createPool({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
    waitForConnections: true,
    connectionLimit: 10,
    timezone: "Z",
    decimalNumbers: true,
  });

  for (const statement of SCHEMA) {
    await pool.query(statement);
  }
}

export async function readyDb() {
  if (!initPromise) {
    initPromise = initialize().catch((error) => {
      initPromise = null;
      pool = null;
      throw error;
    });
  }
  await initPromise;
  if (!pool) throw new Error("Database pool is not ready");
  return pool;
}

export async function query<T extends RowDataPacket[]>(sql: string, params: unknown[] = []) {
  const db = await readyDb();
  const [rows] = await db.query<T>(sql, params);
  return rows;
}

export async function withTx<T>(run: (conn: PoolConnection) => Promise<T>) {
  const db = await readyDb();
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const result = await run(conn);
    await conn.commit();
    return result;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}
