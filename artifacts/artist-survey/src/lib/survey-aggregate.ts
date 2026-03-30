import type { SurveyResults } from "@workspace/api-client-react";

/** Row shape from `survey_responses` (Postgres / Supabase). */
export type SurveyResponseRow = {
  favorite_artist: string;
  genre: string;
  college_year: string;
  platforms: string | string[] | null;
  other_platform: string | null;
};

function parsePlatforms(raw: SurveyResponseRow["platforms"]): string[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw;
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as string[]) : [raw];
  } catch {
    return [raw];
  }
}

/**
 * Same aggregation as `artifacts/api-server/src/routes/survey.ts` GET /results.
 */
export function aggregateSurveyResults(rows: SurveyResponseRow[]): SurveyResults {
  const yearOrder = [
    "1st Year",
    "2nd Year",
    "3rd Year",
    "4th Year",
    "5th Year or More",
  ];
  const yearMap = new Map<string, number>();
  yearOrder.forEach((y) => yearMap.set(y, 0));

  const artistMap = new Map<string, number>();
  const genreMap = new Map<string, number>();
  const platformMap = new Map<string, number>();

  for (const row of rows) {
    const year = row.college_year ?? "";
    yearMap.set(year, (yearMap.get(year) ?? 0) + 1);

    const artistNorm = (row.favorite_artist ?? "")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
    artistMap.set(artistNorm, (artistMap.get(artistNorm) ?? 0) + 1);

    const genreNorm = (row.genre ?? "").trim();
    genreMap.set(genreNorm, (genreMap.get(genreNorm) ?? 0) + 1);

    const platforms = parsePlatforms(row.platforms);

    for (const p of platforms) {
      if (p === "Other" && row.other_platform) {
        const norm = String(row.other_platform)
          .trim()
          .toLowerCase()
          .replace(/\b\w/g, (c) => c.toUpperCase());
        platformMap.set(norm, (platformMap.get(norm) ?? 0) + 1);
      } else {
        platformMap.set(p, (platformMap.get(p) ?? 0) + 1);
      }
    }
  }

  const total_responses = rows.length;

  const year_counts = yearOrder.map((label) => ({
    label,
    count: yearMap.get(label) ?? 0,
  }));

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

  return {
    total_responses,
    year_counts,
    top_artists,
    genre_counts,
    platform_counts,
  };
}
