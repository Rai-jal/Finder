"use client";

import { useQuery } from "@tanstack/react-query";
import { getIndustries, getStages } from "@/lib/api/reference";
import type { Industry, Stage } from "@/lib/api/reference";

export function useIndustries(): {
  industries: Industry[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["industries"],
    queryFn: getIndustries,
    staleTime: 5 * 60 * 1000,
  });
  return {
    industries: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}

export function useStages(): {
  stages: Stage[];
  isLoading: boolean;
  error: Error | null;
} {
  const { data, isLoading, error } = useQuery({
    queryKey: ["stages"],
    queryFn: getStages,
    staleTime: 5 * 60 * 1000,
  });
  return {
    stages: data ?? [],
    isLoading,
    error: error as Error | null,
  };
}

export function useReferenceData(): {
  industries: Industry[];
  stages: Stage[];
  isLoading: boolean;
} {
  const industriesQ = useIndustries();
  const stagesQ = useStages();
  return {
    industries: industriesQ.industries,
    stages: stagesQ.stages,
    isLoading: industriesQ.isLoading || stagesQ.isLoading,
  };
}
