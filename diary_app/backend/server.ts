// backend/server.ts
import express from "express";
import type { Request, Response } from "express";
import pg from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend works");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on 3000");
});

// ✅ Middlewares AVANT les routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || "claire",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "diary_app",
  password: process.env.DB_PASSWORD || "",
  port: Number(process.env.DB_PORT) || 5432,
});

// Types
interface RegisterBody {
  login: string;
  password: string;
}
interface LoginBody {
  login: string;
  password: string;
}
interface GithubAuthBody {
  code: string;
}
interface GoogleAuthBody {
  token: string;
}
interface DiaryEntryBody {
  email: string;
  date: string;
  title: string;
  feeling: number;
  content: string;
}
interface GithubTokenResponse {
  access_token?: string;
  error?: string;
}
interface GithubProfile {
  id: number;
  login: string;
  email: string | null;
}
interface GoogleProfile {
  sub?: string;
  email: string;
}

// Init DB
const initDB = async (): Promise<void> => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255),
        provider VARCHAR(50) DEFAULT 'local',
        provider_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS diary_entries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        title VARCHAR(255),
        feeling INTEGER CHECK (feeling BETWEEN 1 AND 5),
        content TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Migrations — sécurisées si colonnes existent déjà
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50) DEFAULT 'local';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(255);
      ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
    `);

    console.log("✅ Tables ready");
  } catch (err) {
    console.error("❌ DB init failed:", err);
  }
};

// initDB().then(() => {
//   app.listen(3000, () => console.log("Server running on port 3000"));
// });

// REGISTER USER
app.post(
  "/user/register",
  async (req: Request<{}, {}, RegisterBody>, res: Response) => {
    const { login, password } = req.body;
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const result = await pool.query(
        `INSERT INTO users(login, password, provider)
       VALUES($1, $2, 'local')
       RETURNING id, login, provider, created_at`,
        [login, hashedPassword],
      );
      console.log("✅ User registered:", result.rows[0]);
      res.json({ message: "Registration success", user: result.rows[0] });
    } catch (err: any) {
      console.error(err);
      if (err.code === "23505") {
        return res.status(400).json({ error: "Login already exists" });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  },
);

// LOGIN USER
app.post(
  "/user/login",
  async (req: Request<{}, {}, LoginBody>, res: Response) => {
    const { login, password } = req.body;
    try {
      const result = await pool.query("SELECT * FROM users WHERE login = $1", [
        login,
      ]);

      if (result.rows.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const user = result.rows[0];

      if (user.provider !== "local") {
        return res.status(400).json({
          error: `Ce compte utilise ${user.provider}.`,
        });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Invalid password" });
      }

      await pool.query("UPDATE users SET updated_at = NOW() WHERE id = $1", [
        user.id,
      ]);

      console.log("✅ User logged in:", user.login);
      res.json({
        message: "Login success",
        user: { id: user.id, login: user.login, provider: user.provider },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Login failed" });
    }
  },
);

// AUTH GITHUB
app.post(
  "/auth/github",
  async (req: Request<{}, {}, GithubAuthBody>, res: Response) => {
    const { code } = req.body;
    console.log("📡 GitHub code reçu:", code);
    try {
      const response = await fetch(
        "https://github.com/login/oauth/access_token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            client_id: process.env.GITHUB_CLIENT_ID,
            client_secret: process.env.GITHUB_CLIENT_SECRET,
            code,
          }),
        },
      );
      const data = (await response.json()) as GithubTokenResponse;
      if (data.error) return res.status(400).json({ error: data.error });

      const emailsRes = await fetch("https://api.github.com/user/emails", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      const emails = (await emailsRes.json()) as {
        email: string;
        primary: boolean;
      }[];
      const login = emails
        .filter((e) => e.primary === true)
        .map((e) => e.email)[0];

      const profile = (await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${data.access_token}` },
      }).then((r) => r.json())) as GithubProfile;

      const result = await pool.query(
        `INSERT INTO users (login, provider, provider_id, created_at)
        VALUES ($1, 'github', $2, NOW())
        ON CONFLICT (login) DO UPDATE
        SET provider = 'github', provider_id = $2, updated_at = NOW()
        RETURNING id, login, provider`,
        [login, String(profile.id)],
      );

      console.log("✅ GitHub user upserted:", result.rows[0]);
      res.json({ access_token: data.access_token, user: result.rows[0] });
    } catch (err) {
      console.error("❌ GitHub auth error:", err);
      res.status(500).json({ error: "GitHub auth failed" });
    }
  },
);

// AUTH GOOGLE
app.post(
  "/auth/google",
  async (req: Request<{}, {}, GoogleAuthBody>, res: Response) => {
    const { token } = req.body;
    try {
      const profile = (await fetch(
        "https://www.googleapis.com/oauth2/v3/userinfo",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      ).then((r) => r.json())) as GoogleProfile;
      console.log("✅ Google profile:", profile);

      if (!profile.sub)
        return res.status(400).json({ error: "Invalid Google token" });

      // Upsert — crée ou met à jour l'utilisateur
      const result = await pool.query(
        `INSERT INTO users (login, provider, provider_id, created_at)
       VALUES ($1, 'google', $2, NOW())
       ON CONFLICT (login) DO UPDATE
       SET provider = 'google',
           provider_id = $2,
           updated_at = NOW()
       RETURNING id, login, provider`,
        [profile.email, String(profile.sub)],
      );

      console.log("✅ Google user upserted:", result.rows[0]);
      res.json({ user: result.rows[0] });
    } catch (err) {
      console.error("❌ Google auth error:", err);
      res.status(500).json({ error: "Google auth failed" });
    }
  },
);

// CREATE DIARY ENTRY
app.post(
  "/entries",
  async (req: Request<{}, {}, DiaryEntryBody>, res: Response) => {
    const { email, date, title, feeling, content } = req.body;
    try {
      const userResult = await pool.query(
        "SELECT id FROM users WHERE login = $1",
        [email],
      );
      if (userResult.rows.length === 0)
        return res.status(404).json({ error: "User not found" });
      const user_id: number = userResult.rows[0].id;
      const result = await pool.query(
        `INSERT INTO diary_entries (user_id, date, title, feeling, content)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, date, title, feeling, content],
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to create entry" });
    }
  },
);

// GET ENTRIES FOR USER
app.get("/entries/:email", async (req, res) => {
  const { email } = req.params;
  const page = Number(req.query.page ?? 0);
  const limit = 6;
  const offset = page * limit;

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM diary_entries e
       JOIN users u ON e.user_id = u.id
       WHERE u.login = $1`,
      [email],
    );
    const total = Number(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT e.* FROM diary_entries e
       JOIN users u ON e.user_id = u.id
       WHERE u.login = $1
       ORDER BY e.created_at DESC
       LIMIT $2 OFFSET $3`,
      [email, limit, offset],
    );

    res.json({
      entries: result.rows,
      hasNext: offset + limit < total,
      hasPrev: page > 0,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch entries" });
  }
});

// GET COUNT OF ENTRIES FOR USER
app.get(
  "/entries/:login/count",
  async (req: Request<{ login: string }>, res: Response) => {
    const { login } = req.params;

    try {
      const result = await pool.query(
        `SELECT COUNT(*) 
         FROM diary_entries e
         JOIN users u ON e.user_id = u.id
         WHERE u.login = $1`,
        [login],
      );

      res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to count entries" });
    }
  },
);

// GET FEELING STATS FOR USER
app.get(
  "/entries/:email/stats",
  async (req: Request<{ email: string }>, res: Response) => {
    const { email } = req.params;
    try {
      const result = await pool.query(
        `SELECT feeling, COUNT(*) as count
       FROM diary_entries e
       JOIN users u ON e.user_id = u.id
       WHERE u.login = $1
       GROUP BY feeling
       ORDER BY feeling`,
        [email],
      );

      const total = result.rows.reduce((sum, r) => sum + parseInt(r.count), 0);
      const stats = [1, 2, 3, 4, 5].reduce(
        (acc, f) => {
          const row = result.rows.find((r) => parseInt(r.feeling) === f);
          const count = row ? parseInt(row.count) : 0;
          acc[f] = {
            count,
            percentage: total > 0 ? Math.round((count / total) * 100) : 0,
          };
          return acc;
        },
        {} as Record<number, { count: number; percentage: number }>,
      );

      res.json({ stats, total });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  },
);

// DELETE DIARY ENTRY
app.delete(
  "/entries/:id",
  async (req: Request<{ id: string }>, res: Response) => {
    const { id } = req.params;
    try {
      const result = await pool.query(
        "DELETE FROM diary_entries WHERE id = $1 RETURNING *",
        [id],
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Entry not found" });
      }
      console.log("✅ Entry deleted:", result.rows[0]);
      res.json({ message: "Entry deleted", entry: result.rows[0] });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to delete entry" });
    }
  },
);

// GET ENTRIES FOR USER BY DATE
app.get(
  "/entries/:email/date/:date",
  async (req: Request<{ email: string; date: string }>, res: Response) => {
    const { email, date } = req.params;
    const page = Number(req.query.page ?? 0);
    const limit = 4;
    const offset = page * limit;

    try {
      // Count total pour la pagination
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM diary_entries e
         JOIN users u ON e.user_id = u.id
         WHERE u.login = $1 AND e.date = $2`,
        [email, date],
      );
      const total = parseInt(countResult.rows[0].count);

      const result = await pool.query(
        `SELECT e.* FROM diary_entries e
         JOIN users u ON e.user_id = u.id
         WHERE u.login = $1 AND e.date = $2
         ORDER BY e.created_at DESC
         LIMIT $3 OFFSET $4`,
        [email, date, limit, offset],
      );

      res.json({
        entries: result.rows,
        page,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: offset + limit < total,
        hasPrev: page > 0,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch entries by date" });
    }
  },
);
