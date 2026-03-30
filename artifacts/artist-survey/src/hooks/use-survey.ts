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
import { SURVEY_DEMO_ROWS } from "@/lib/survey-demo-rows";

export const surveyResultsQueryKey = ["surveyResults"] as const;

export type SurveyResultsPayload = {
  results: SurveyResults;
  /** Includes built-in sample rows (empty DB, append mode, or Supabase fetch failed). */
  isSampleData: boolean;
  /** Sample rows merged with Supabase (`VITE_SURVEY_APPEND_DEMO=true`). */
  isAppendDemo: boolean;
  /** Supabase select failed or client misconfigured; charts show sample data only. */
  remoteFetchFailed: boolean;
  remoteErrorMessage?: string;
};

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
      " — Often: VITE_SUPABASE_URL must be your Supabase Project URL (.supabase.co), " +
      "the table must be a real TABLE with SELECT allowed for `anon`, not a view.";
  }

  return msg;
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

async function fetchSurveyResults(): Promise<SurveyResultsPayload> {
  let remote: SurveyResponseRow[] = [];
  let remoteError: string | undefined;

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from("survey_responses").select("*");
    if (error) {
      remoteError = formatSupabaseRequestError(error);
    } else {
      remote = normalizeRemoteRows((data ?? []) as SurveyResponseRow[]);
    }
  } catch (e) {
    remoteError = e instanceof Error ? e.message : String(e);
  }

  const appendDemo = import.meta.env.VITE_SURVEY_APPEND_DEMO === "true";

  let rows: SurveyResponseRow[];
  let isSampleData: boolean;
  let isAppendDemo: boolean;

  if (remoteError) {
    rows = SURVEY_DEMO_ROWS;
    isSampleData = true;
    isAppendDemo = false;
  } else if (appendDemo) {
    rows = [...SURVEY_DEMO_ROWS, ...remote];
    isSampleData = true;
    isAppendDemo = true;
  } else if (remote.length === 0) {
    rows = SURVEY_DEMO_ROWS;
    isSampleData = true;
    isAppendDemo = false;
  } else {
    rows = remote;
    isSampleData = false;
    isAppendDemo = false;
  }

  try {
    return {
      results: aggregateSurveyResults(rows),
      isSampleData,
      isAppendDemo,
      remoteFetchFailed: Boolean(remoteError),
      remoteErrorMessage: remoteError,
    };
  } catch (e) {
    const hint = e instanceof Error ? e.message : String(e);
    return {
      results: aggregateSurveyResults(SURVEY_DEMO_ROWS),
      isSampleData: true,
      isAppendDemo: false,
      remoteFetchFailed: true,
      remoteErrorMessage: remoteError ?? `Could not aggregate survey rows: ${hint}`,
    };
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

export function useGetSurveyResults(): UseQueryResult<
  SurveyResultsPayload,
  Error
> {
  return useQuery({
    queryKey: surveyResultsQueryKey,
    queryFn: fetchSurveyResults,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  });
}
