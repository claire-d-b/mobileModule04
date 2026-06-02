import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const { Pool } = pg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

const seedTestUser = async (): Promise<void> => {
  try {
    console.log("🌱 Seeding test user...");

    // Create test user
    const hashedPassword = await bcrypt.hash("Test1234", 10);

    const userResult = await pool.query(
      `INSERT INTO users (login, password, provider)
       VALUES ($1, $2, 'local')
       ON CONFLICT (login) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, login`,
      ["test_user", hashedPassword],
    );

    const user = userResult.rows[0];
    console.log(`✅ User created: ${user.login} (id: ${user.id})`);

    // Sample diary entries
    const entries = [
      {
        date: "2025-01-01",
        title: "New Year, fresh start",
        feeling: 5,
        content: "Feeling great about the year ahead. Lots of goals to tackle.",
      },
      {
        date: "2025-01-10",
        title: "Rough day",
        feeling: 2,
        content:
          "Work was stressful and I didn't sleep well. Need to rest more.",
      },
      {
        date: "2025-01-20",
        title: "Good progress",
        feeling: 4,
        content: "Made solid progress on my side project. Feeling motivated.",
      },
      {
        date: "2025-02-05",
        title: "Weekend hike",
        feeling: 5,
        content:
          "Spent the day hiking in the forest. Nature really recharges me.",
      },
      {
        date: "2025-02-14",
        title: "Valentine's",
        feeling: 3,
        content: "Quiet day. Cooked a nice dinner at home.",
      },
    ];

    for (const entry of entries) {
      await pool.query(
        `INSERT INTO diary_entries (user_id, date, title, feeling, content)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, entry.date, entry.title, entry.feeling, entry.content],
      );
    }

    console.log(`✅ ${entries.length} diary entries inserted`);
    console.log("✅ Seeding complete");
    console.log("─────────────────────────────");
    console.log("  login:    test_user");
    console.log("  password: Test1234");
    console.log("─────────────────────────────");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await pool.end();
  }
};

seedTestUser();
