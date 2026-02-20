"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";

const ONBOARDING_ROUTE = "/onboarding";
const EXCLUDED_FROM_ONBOARDING = ["/auth", "/onboarding"];

export function useOnboardingRedirect() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { hasCompletedOnboarding } = useOnboarding();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (EXCLUDED_FROM_ONBOARDING.some((r) => pathname.startsWith(r))) return;

    if (!hasCompletedOnboarding) {
      router.replace(ONBOARDING_ROUTE);
    }
  }, [isAuthenticated, hasCompletedOnboarding, pathname, router]);
}
