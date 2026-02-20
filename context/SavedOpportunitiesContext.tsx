"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useStartup } from "@/context/StartupContext";
import { apiGetSavedOpportunities, apiSaveOpportunity, apiUnsaveOpportunity } from "@/lib/api/client";
import { getToken } from "@/lib/api/client";

interface SavedOpportunitiesContextValue {
  savedIds: Set<string>;
  toggleSaved: (id: string) => void;
  isSaved: (id: string) => boolean;
  refresh: () => Promise<void>;
}

const SavedOpportunitiesContext = createContext<SavedOpportunitiesContextValue | null>(null);

export function SavedOpportunitiesProvider({ children }: { children: React.ReactNode }) {
  const startup = useStartup();
  const startupId = startup?.startupId ?? null;
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!getToken() || !startupId) return;
    try {
      const ids = await apiGetSavedOpportunities(startupId);
      setSavedIds(new Set(ids.filter(Boolean)));
    } catch {
      setSavedIds(new Set());
    }
  }, [startupId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleSaved = useCallback(
    async (id: string) => {
      if (startupId && getToken()) {
        const isCurrentlySaved = savedIds.has(id);
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (isCurrentlySaved) next.delete(id);
          else next.add(id);
          return next;
        });
        try {
          if (isCurrentlySaved) {
            await apiUnsaveOpportunity(startupId, id);
          } else {
            await apiSaveOpportunity(startupId, id);
          }
        } catch {
          setSavedIds((prev) => {
            const next = new Set(prev);
            if (isCurrentlySaved) next.add(id);
            else next.delete(id);
            return next;
          });
        }
      } else {
        setSavedIds((prev) => {
          const next = new Set(prev);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      }
    },
    [startupId, savedIds]
  );

  const isSaved = useCallback(
    (id: string) => savedIds.has(id),
    [savedIds]
  );

  const value: SavedOpportunitiesContextValue = {
    savedIds,
    toggleSaved,
    isSaved,
    refresh,
  };

  return (
    <SavedOpportunitiesContext.Provider value={value}>
      {children}
    </SavedOpportunitiesContext.Provider>
  );
}

export function useSavedOpportunities() {
  const ctx = useContext(SavedOpportunitiesContext);
  if (!ctx) throw new Error("useSavedOpportunities must be used within SavedOpportunitiesProvider");
  return ctx;
}
