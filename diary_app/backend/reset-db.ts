import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const resetDB = async (): Promise<void> => {
  try {
    console.log("Resetting database...");

    await pool.query(`
      DROP TABLE IF EXISTS diary_entries CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);
    console.log("Tables dropped");

    await pool.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        provider VARCHAR(50) DEFAULT 'local',
        provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE diary_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        title VARCHAR(255),
        feeling INTEGER CHECK (feeling BETWEEN 1 AND 5),
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS trigger_users_updated_at ON users;
      CREATE TRIGGER trigger_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();

      DROP TRIGGER IF EXISTS trigger_diary_entries_updated_at ON diary_entries;
      CREATE TRIGGER trigger_diary_entries_updated_at
        BEFORE UPDATE ON diary_entries
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `);

    console.log("Tables recreated");
    console.log("Database reset complete");
  } catch (e) {
    console.error("Reset failed:", e);
  } finally {
    await pool.end();
  }
};

resetDB();
