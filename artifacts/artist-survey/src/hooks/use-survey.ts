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
      " — Often: VITE_SUPABASE_URL is not your Supabase project URL (e.g. built with static site URL), " +
      "or `survey_responses` is a VIEW (must be a TABLE), or you are using a read-replica URL. " +
      "Confirm Dashboard → Settings → API → Project URL, and run `supabase/survey_responses.sql` on a real table.";
  }

  return msg;
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

async function fetchSurveyResults(): Promise<SurveyResults> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("survey_responses").select("*");

  if (error) {
    throw new Error(formatSupabaseRequestError(error));
  }

  const rows = (data ?? []) as SurveyResponseRow[];
  return aggregateSurveyResults(rows);
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
