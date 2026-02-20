"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { User, SubscriptionTier } from "@/types";
import { login, signup, logout as apiLogout } from "@/lib/api";
import { apiMe, apiGetSubscription, getToken } from "@/lib/api/client";

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
      const tier = (me.subscription_tier ?? sub?.tier ?? "free") as "free" | "premium";
      setUser({
        id: me.id,
        email: me.email,
        startupName: me.startup?.name ?? me.name ?? "",
        subscriptionTier: tier === "premium" ? "premium" : "free",
      });
    }
  }, []);

  useEffect(() => {
    if (!getToken()) {
      setIsLoading(false);
      return;
    }
    apiMe()
      .then((me) => {
        if (me) {
          setUser({
            id: me.id,
            email: me.email,
            startupName: me.startup?.name ?? me.name ?? "",
            subscriptionTier: (me.subscription_tier as "free" | "premium") ?? "free",
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
    setUser(null);
  }, []);

  const setSubscriptionTier = useCallback((tier: SubscriptionTier) => {
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
