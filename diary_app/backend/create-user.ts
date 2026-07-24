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
    console.log(`User created: ${user.login} (id: ${user.id})`);

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
      // --- A very very long entry ---
      {
        date: "2026-05-20",
        title:
          "A very long entry for testing - A very long entry for testing - A very long entry for testing - A very long entry for testing",
        feeling: 3,
        content:
          "I woke up this morning with no particular plan, which is rare for me, and I found myself just sitting by the window for almost half an hour, watching the light change as the sun came up over the rooftops across the street. There's something strange about days like this, days where nothing especially eventful happens, but where every small moment seems to stretch out and ask to be noticed. I made coffee, slower than usual, and I thought about how much of my life lately has been lived at a sprint, jumping from one task to the next without ever really landing anywhere. Today felt different. I spent the morning reading, actually reading, not skimming articles on my phone but sitting with an actual book for almost two hours, which I haven't done in longer than I'd like to admit. Around midday I went for a walk with no destination in mind, just to see where my feet would take me, and I ended up at a small park I'd never noticed before, tucked behind a row of buildings I must have passed a hundred times. There were kids playing some kind of game with chalk on the pavement, and an old man feeding pigeons from a bench, and for a while I just sat there and watched, not thinking about work or deadlines or any of the usual noise that fills my head. In the afternoon I called my sister, which I've been meaning to do for weeks, and we talked for almost an hour about nothing in particular — her new apartment, our parents, a show she's been watching — and it reminded me how easy it is to let relationships go quiet simply through inattention rather than any real falling out. By evening I cooked a proper meal instead of ordering something, and it took much longer than it needed to, but I didn't mind, there was something grounding about chopping vegetables and waiting for things to simmer rather than rushing toward the fastest possible outcome. I think what I'm trying to say, if I'm being honest with myself, is that today reminded me how much I've been running on autopilot lately, treating each day as a checklist to clear rather than something to actually experience. I don't know if I'll manage to hold onto this feeling tomorrow, or if by Monday I'll be back to rushing through everything without noticing much of it, but for tonight at least, I feel unusually present, and unusually at peace, and I wanted to write all of this down so that on some future rough day I can come back and remember that it's possible to slow down, even if just for one day, and that the slowing down itself was worth something.",
      },
    ];

    for (const entry of entries) {
      await pool.query(
        `INSERT INTO diary_entries (user_id, date, title, feeling, content)
         VALUES ($1, $2, $3, $4, $5)`,
        [user.id, entry.date, entry.title, entry.feeling, entry.content],
      );
    }

    console.log(`${entries.length} diary entries inserted`);
  } catch (e) {
    console.error("Seeding failed:", e);
  } finally {
    await pool.end();
  }
};

seedTestUser();
