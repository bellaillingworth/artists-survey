import { Router, type IRouter } from "express";
import { db, surveyResponsesTable } from "@workspace/db";
import { SubmitSurveyBody } from "@workspace/api-zod";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

router.post("/responses", async (req, res) => {
  const parsed = SubmitSurveyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  const { favorite_artist, genre, college_year, platforms, other_platform } = parsed.data;

  try {
    const [row] = await db.insert(surveyResponsesTable).values({
      favorite_artist,
      genre,
      college_year,
      platforms: JSON.stringify(platforms),
      other_platform: other_platform ?? null,
    }).returning({ id: surveyResponsesTable.id, created_at: surveyResponsesTable.created_at });

    res.status(201).json({ id: row.id, created_at: row.created_at });
  } catch (err) {
    req.log.error({ err }, "Failed to insert survey response");
    res.status(500).json({ error: "Database error" });
  }
});

router.get("/results", async (req, res) => {
  try {
    const rows = await db.select().from(surveyResponsesTable);

    const total_responses = rows.length;

    const yearOrder = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year or More"];
    const yearMap = new Map<string, number>();
    yearOrder.forEach(y => yearMap.set(y, 0));

    const artistMap = new Map<string, number>();
    const genreMap = new Map<string, number>();
    const platformMap = new Map<string, number>();

    for (const row of rows) {
      const year = row.college_year;
      yearMap.set(year, (yearMap.get(year) ?? 0) + 1);

      const artistNorm = row.favorite_artist.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
      artistMap.set(artistNorm, (artistMap.get(artistNorm) ?? 0) + 1);

      const genreNorm = row.genre.trim();
      genreMap.set(genreNorm, (genreMap.get(genreNorm) ?? 0) + 1);

      let platforms: string[] = [];
      try {
        platforms = JSON.parse(row.platforms);
      } catch {
        platforms = [row.platforms];
      }

      for (const p of platforms) {
        if (p === "Other" && row.other_platform) {
          const norm = row.other_platform.trim().toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
          platformMap.set(norm, (platformMap.get(norm) ?? 0) + 1);
        } else {
          platformMap.set(p, (platformMap.get(p) ?? 0) + 1);
        }
      }
    }

    const year_counts = yearOrder.map(label => ({ label, count: yearMap.get(label) ?? 0 }));

    const top_artists = [...artistMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([label, count]) => ({ label, count }));

    const genre_counts = [...genreMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));

    const platform_counts = [...platformMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }));

    res.json({ total_responses, year_counts, top_artists, genre_counts, platform_counts });
  } catch (err) {
    req.log.error({ err }, "Failed to fetch survey results");
    res.status(500).json({ error: "Database error" });
  }
});

export default router;
