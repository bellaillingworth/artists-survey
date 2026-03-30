import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import type {
  SurveyResults,
  SurveySubmission,
  SurveyResponse,
} from "@workspace/api-client-react";
import { getSupabase } from "@/lib/supabase";
import {
  aggregateSurveyResults,
  type SurveyResponseRow,
} from "@/lib/survey-aggregate";

export const surveyResultsQueryKey = ["surveyResults"] as const;

const FETCH_NETWORK_HINT =
  " — Troubleshooting: GitHub secrets should match Supabase → Settings → API (project URL https://<ref>.supabase.co, anon key, no quotes or line breaks). Resume project if paused; allow your site origin if API access is restricted.";

function appendFetchFailureHint(message: string): string {
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(message)) {
    return message + FETCH_NETWORK_HINT;
  }
  return message;
}

function formatSupabaseRequestError(err: {
  message: string;
  code?: string;
  details?: string | null;
  hint?: string | null;
}): string {
  const parts = [err.message];
  if (err.details) parts.push(String(err.details));
  if (err.hint) parts.push(String(err.hint));
  if (err.code) parts.push(`code ${err.code}`);

  let msg = parts.filter(Boolean).join(" — ");

  if (/405|method not allowed/i.test(msg)) {
    msg +=
      " — Use the Project URL (.supabase.co) and a real table with anon SELECT, not a view-only relation.";
  }

  return appendFetchFailureHint(msg);
}

function normalizeRemoteRows(raw: SurveyResponseRow[]): SurveyResponseRow[] {
  return raw.map((r) => ({
    favorite_artist: String(r?.favorite_artist ?? ""),
    genre: String(r?.genre ?? ""),
    college_year: String(r?.college_year ?? ""),
    platforms: r?.platforms ?? "[]",
    other_platform: r?.other_platform ?? null,
  }));
}

async function fetchSurveyResults(): Promise<SurveyResults> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("survey_responses").select("*");

  if (error) {
    throw new Error(formatSupabaseRequestError(error));
  }

  const rows = normalizeRemoteRows((data ?? []) as SurveyResponseRow[]);
  try {
    return aggregateSurveyResults(rows);
  } catch (e) {
    const hint = e instanceof Error ? e.message : String(e);
    throw new Error(`Could not aggregate survey rows: ${hint}`);
  }
}

async function submitSurveyToSupabase(
  body: SurveySubmission,
): Promise<SurveyResponse> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("survey_responses")
    .insert({
      favorite_artist: body.favorite_artist,
      genre: body.genre,
      college_year: body.college_year,
      platforms: JSON.stringify(body.platforms),
      other_platform: body.other_platform ?? null,
    })
    .select("id, created_at")
    .maybeSingle();

  if (error) {
    throw new Error(formatSupabaseRequestError(error));
  }

  if (!data) {
    throw new Error(
      "Insert succeeded but no row was returned. Check RLS: `anon` needs SELECT on `survey_responses` for returning rows.",
    );
  }

  const rawId = data.id as number | string;
  const id = typeof rawId === "string" ? Number(rawId) : rawId;

  return {
    id,
    created_at: data.created_at as string,
  };
}

export function useSubmitSurvey(): UseMutationResult<
  SurveyResponse,
  Error,
  { data: SurveySubmission }
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data }: { data: SurveySubmission }) =>
      submitSurveyToSupabase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: surveyResultsQueryKey });
    },
  });
}

export function useGetSurveyResults(): UseQueryResult<SurveyResults, Error> {
  return useQuery({
    queryKey: surveyResultsQueryKey,
    queryFn: fetchSurveyResults,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
}
