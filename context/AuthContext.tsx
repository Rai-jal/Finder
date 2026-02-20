"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User, SubscriptionTier } from "@/types";
import { login, signup, logout as apiLogout } from "@/lib/api";
import { apiMe, apiGetSubscription, getToken } from "@/lib/api/client";

const PREMIUM_STORAGE_KEY = "finder_subscription_tier";

function getStoredTier(): SubscriptionTier | null {
  if (typeof window === "undefined") return null;
  try {
    const s = localStorage.getItem(PREMIUM_STORAGE_KEY);
    return s === "premium" ? "premium" : null;
  } catch {
    return null;
  }
}

function setStoredTier(tier: SubscriptionTier | null) {
  if (typeof window === "undefined") return;
  try {
    if (tier === "premium") {
      localStorage.setItem(PREMIUM_STORAGE_KEY, "premium");
    } else {
      localStorage.removeItem(PREMIUM_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  subscriptionTier: SubscriptionTier;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: { email: string; password: string; passwordConfirmation: string; name: string; startupName: string }) => Promise<void>;
  logout: () => Promise<void>;
  setSubscriptionTier: (tier: SubscriptionTier) => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    if (!getToken()) return;
    const [me, sub] = await Promise.all([apiMe(), apiGetSubscription()]);
    if (me) {
      const backendTier = (me.subscription_tier ?? sub?.tier ?? "free") as "free" | "premium";
      const storedTier = getStoredTier();
      const tier = backendTier === "premium" || storedTier === "premium" ? "premium" : "free";
      if (tier === "premium") setStoredTier("premium");
      setUser({
        id: me.id,
        email: me.email,
        startupName: me.startup?.name ?? me.name ?? "",
        subscriptionTier: tier,
      });
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setStoredTier(null);
      setIsLoading(false);
      return;
    }
    apiMe()
      .then((me) => {
        if (me) {
          const backendTier = (me.subscription_tier as "free" | "premium") ?? "free";
          const storedTier = getStoredTier();
          const tier = backendTier === "premium" || storedTier === "premium" ? "premium" : "free";
          if (tier === "premium") setStoredTier("premium");
          setUser({
            id: me.id,
            email: me.email,
            startupName: me.startup?.name ?? me.name ?? "",
            subscriptionTier: tier,
          });
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const loginFn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const u = await login(email, password);
      setUser(u);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signupFn = useCallback(
    async (data: { email: string; password: string; passwordConfirmation: string; name: string; startupName: string }) => {
      setIsLoading(true);
      try {
        const u = await signup(data);
        setUser(u);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logoutFn = useCallback(async () => {
    await apiLogout();
    setStoredTier(null);
    setUser(null);
  }, []);

  const setSubscriptionTier = useCallback((tier: SubscriptionTier) => {
    setStoredTier(tier);
    setUser((prev) => (prev ? { ...prev, subscriptionTier: tier } : null));
  }, []);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    subscriptionTier: user?.subscriptionTier ?? "free",
    isLoading,
    login: loginFn,
    signup: signupFn,
    logout: logoutFn,
    setSubscriptionTier,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
