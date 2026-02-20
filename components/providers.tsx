"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { AuthProvider } from "@/context/AuthContext";
import { StartupProvider } from "@/context/StartupContext";
import { NotificationProvider } from "@/context/NotificationContext";
import { OnboardingProvider } from "@/context/OnboardingContext";
import { SavedOpportunitiesProvider } from "@/context/SavedOpportunitiesContext";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 1000 } },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StartupProvider>
          <OnboardingProvider>
            <NotificationProvider>
              <SavedOpportunitiesProvider>{children}</SavedOpportunitiesProvider>
            </NotificationProvider>
          </OnboardingProvider>
        </StartupProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
