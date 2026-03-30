import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// In the actual monorepo this imports from @workspace/api-client-react
// The instructions specify we should use @workspace/api-client-react hooks
import { 
  useSubmitSurvey as useGeneratedSubmitSurvey, 
  useGetSurveyResults as useGeneratedGetSurveyResults,
  getGetSurveyResultsQueryKey
} from "@workspace/api-client-react";

export function useSubmitSurvey() {
  const queryClient = useQueryClient();
  
  return useGeneratedSubmitSurvey({
    mutation: {
      onSuccess: () => {
        // Invalidate results query so charts update immediately
        queryClient.invalidateQueries({ queryKey: getGetSurveyResultsQueryKey() });
      }
    }
  });
}

export function useGetSurveyResults() {
  return useGeneratedGetSurveyResults({
    query: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  });
}
