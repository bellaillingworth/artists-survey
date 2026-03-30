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
    .single();

  if (error) {
    throw new Error(error.message);
  }
  return {
    id: data.id as number,
    created_at: data.created_at as string,
  };
}

async function fetchSurveyResults(): Promise<SurveyResults> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("survey_responses").select("*");

  if (error) {
    throw new Error(error.message);
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
