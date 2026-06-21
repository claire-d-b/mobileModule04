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
    const testPassword = process.env.TEST_USER_PASSWORD;
    if (!testPassword) throw new Error("Missing TEST_USER_PASSWORD in .env");
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    const userResult = await pool.query(
      `INSERT INTO users (login, password, provider)
       VALUES ($1, $2, 'local')
       ON CONFLICT (login) DO UPDATE SET password = EXCLUDED.password
       RETURNING id, login`,
      ["test_user", hashedPassword],
    );
    const user = userResult.rows[0];
    console.log(`✅ User created: ${user.login} (id: ${user.id})`);

    const entries = [
      // --- 10 entries on 2026-05-15 (pagination testing) ---
      {
        date: "2026-05-15",
        title: "Morning pages",
        feeling: 3,
        content:
          "Woke up early and wrote for 20 minutes before checking my phone. Felt calm.",
      },
      {
        date: "2026-05-15",
        title: "Breakfast thoughts",
        feeling: 4,
        content:
          "Made proper eggs for once. Small thing but it set a good tone.",
      },
      {
        date: "2026-05-15",
        title: "Commute observation",
        feeling: 3,
        content:
          "Watched a kid fall asleep on his dad's shoulder on the metro. Sweet.",
      },
      {
        date: "2026-05-15",
        title: "Morning meeting",
        feeling: 2,
        content: "Long standup again. We really need to timebox these.",
      },
      {
        date: "2026-05-15",
        title: "Lunch alone",
        feeling: 3,
        content:
          "Ate outside by myself. Nice to have a break from screens and people.",
      },
      {
        date: "2026-05-15",
        title: "Afternoon focus",
        feeling: 4,
        content: "Got into a real flow state for two hours. Felt great.",
      },
      {
        date: "2026-05-15",
        title: "Coffee break chat",
        feeling: 4,
        content:
          "Had a long chat with a colleague I don't usually talk to. Interesting person.",
      },
      {
        date: "2026-05-15",
        title: "End of day slump",
        feeling: 2,
        content:
          "Hit a wall around 4pm. Couldn't focus on anything useful after that.",
      },
      {
        date: "2026-05-15",
        title: "Evening run",
        feeling: 5,
        content: "Pushed through tiredness and went anyway. So glad I did.",
      },
      {
        date: "2026-05-15",
        title: "Night reflection",
        feeling: 4,
        content:
          "Oddly full day. Lots of small moments that added up to something good.",
      },

      // --- 10 random entries from Jan to May 2026 ---
      {
        date: "2026-01-10",
        title: "Rough day",
        feeling: 2,
        content:
          "Work was stressful and I didn't sleep well. Need to rest more.",
      },
      {
        date: "2026-01-24",
        title: "Weekend hike",
        feeling: 5,
        content:
          "Spent the day hiking in the forest. Nature really recharges me.",
      },
      {
        date: "2026-02-08",
        title: "Dinner party",
        feeling: 5,
        content:
          "Hosted friends for the first time in ages. Laughed until midnight.",
      },
      {
        date: "2026-02-20",
        title: "Got the offer!",
        feeling: 5,
        content:
          "They called this morning. I'm taking it. Nervous and excited.",
      },
      {
        date: "2026-03-05",
        title: "Conflict at work",
        feeling: 2,
        content: "Disagreement with a colleague. Hope it blows over.",
      },
      {
        date: "2026-03-19",
        title: "Spring is here",
        feeling: 4,
        content:
          "First warm evening of the year. Sat outside with a coffee. Bliss.",
      },
      {
        date: "2026-04-02",
        title: "Heatwave already",
        feeling: 2,
        content: "Too hot for April. Can't sleep. Just surviving.",
      },
      {
        date: "2026-04-17",
        title: "Frustrating bug",
        feeling: 2,
        content:
          "Spent 4 hours on a bug that turned out to be a typo. Classic.",
      },
      {
        date: "2026-04-28",
        title: "Long weekend",
        feeling: 5,
        content: "Four days off. No plans, no pressure. Pure relief.",
      },
      {
        date: "2026-05-03",
        title: "Back to it",
        feeling: 3,
        content: "Post-holiday blues but the weather is nice. Could be worse.",
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
  } catch (err) {
    console.error("❌ Seeding failed:", err);
  } finally {
    await pool.end();
  }
};

seedTestUser();
