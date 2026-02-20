"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { apiGetStartups, apiCreateStartup, getToken } from "@/lib/api/client";

interface StartupContextValue {
  startupId: string | null;
  startupName: string;
  isLoading: boolean;
  refresh: () => Promise<void>;
  ensureStartup: (name: string) => Promise<string>;
  setStartup: (id: string, name: string) => void;
}

const StartupContext = createContext<StartupContextValue | null>(null);

export function StartupProvider({ children }: { children: React.ReactNode }) {
  const [startupId, setStartupId] = useState<string | null>(null);
  const [startupName, setStartupName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    try {
      const list = await apiGetStartups();
      if (list.length > 0) {
        setStartupId(list[0]!.id);
        setStartupName(list[0]!.name ?? "");
      } else {
        setStartupId(null);
        setStartupName("");
      }
    } catch {
      setStartupId(null);
      setStartupName("");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const ensureStartup = useCallback(async (name: string): Promise<string> => {
    if (startupId) return startupId;
    const created = await apiCreateStartup({ name });
    setStartupId(created.id);
    setStartupName(created.name ?? name);
    return created.id;
  }, [startupId]);

  const setStartup = useCallback((id: string, name: string) => {
    setStartupId(id);
    setStartupName(name);
  }, []);

  const value: StartupContextValue = {
    startupId,
    startupName,
    isLoading,
    refresh,
    ensureStartup,
    setStartup,
  };

  return (
    <StartupContext.Provider value={value}>
      {children}
    </StartupContext.Provider>
  );
}

export function useStartup() {
  const ctx = useContext(StartupContext);
  return ctx;
}
