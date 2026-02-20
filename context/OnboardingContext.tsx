"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { OnboardingData } from "@/types";

const ONBOARDING_KEY = "finder_has_completed_onboarding";
const ONBOARDING_DATA_KEY = "finder_onboarding_data";

// Fields used for profile completion calculation
const PROFILE_FIELDS = [
  "startupName",
  "description",
  "registeredBusiness",
  "sectors",
  "stage",
  "location",
  "teamSize",
  "revenueRange",
  "categories",
] as const;

function getProfileCompletionPercent(data: Partial<OnboardingData> | null): number {
  if (!data) return 0;
  let filled = 0;
  let total = PROFILE_FIELDS.length;

  if (data.startupIdentity?.startupName) filled++;
  if (data.startupIdentity?.description) filled++;
  if (data.startupIdentity?.registeredBusiness != null) filled++;
  if (data.qualification?.sectors?.length) filled++;
  if (data.qualification?.stage) filled++;
  if (data.qualification?.country || data.qualification?.location) filled++;
  if (data.qualification?.teamSize) filled++;
  if (data.qualification?.revenueRange) filled++;
  if (data.categories?.length) filled++;

  return Math.round((filled / total) * 100);
}

interface OnboardingContextValue {
  onboardingData: Partial<OnboardingData> | null;
  setOnboardingData: (data: Partial<OnboardingData>) => void;
  updateProfileData: (data: Partial<OnboardingData>) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (value: boolean) => void;
  profileCompletionPercent: number;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const [onboardingData, setOnboardingDataState] = useState<Partial<OnboardingData> | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboardingState] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(ONBOARDING_KEY) === "true";
    setHasCompletedOnboardingState(stored);
    try {
      const dataStr = localStorage.getItem(ONBOARDING_DATA_KEY);
      if (dataStr) {
        const data = JSON.parse(dataStr) as Partial<OnboardingData>;
        setOnboardingDataState(data);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const persistData = useCallback((data: Partial<OnboardingData> | null) => {
    if (typeof window !== "undefined" && data) {
      localStorage.setItem(ONBOARDING_DATA_KEY, JSON.stringify(data));
    }
  }, []);

  const setHasCompletedOnboarding = useCallback((value: boolean) => {
    setHasCompletedOnboardingState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(ONBOARDING_KEY, String(value));
    }
  }, []);

  const setOnboardingData = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingDataState((prev) => {
      const next = { ...prev, ...data };
      persistData(next);
      return next;
    });
  }, [persistData]);

  const updateProfileData = useCallback((data: Partial<OnboardingData>) => {
    setOnboardingDataState((prev) => {
      const next = { ...prev, ...data };
      persistData(next);
      return next;
    });
  }, [persistData]);

  const profileCompletionPercent = getProfileCompletionPercent(onboardingData);

  const value: OnboardingContextValue = {
    onboardingData,
    setOnboardingData,
    updateProfileData,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    profileCompletionPercent,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const ctx = useContext(OnboardingContext);
  if (!ctx) throw new Error("useOnboarding must be used within OnboardingProvider");
  return ctx;
}
