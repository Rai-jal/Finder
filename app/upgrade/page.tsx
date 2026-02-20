"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { apiGetSubscriptions, apiSubscribe } from "@/lib/api/client";
import type { ApiSubscription } from "@/lib/api/client";

const FREE_FEATURES = [
  "Browse opportunities",
  "Basic search and filters",
  "Save opportunities",
  "Limited opportunity details",
];

const PREMIUM_FEATURES = [
  "Full eligibility criteria",
  "Required documents list",
  "Application questions preview",
  "Application workspace with auto-save",
  "Export applications to PDF",
  "Priority support",
];

export default function UpgradePage() {
  const { subscriptionTier, refreshUser, setSubscriptionTier } = useAuth();
  const [plans, setPlans] = useState<ApiSubscription[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiGetSubscriptions()
      .then(setPlans)
      .catch(() => setPlans([]));
  }, []);

  const handleSubscribe = async (subscriptionId: string) => {
    setLoading(subscriptionId);
    setError(null);
    setSuccess(false);
    try {
      await apiSubscribe(String(subscriptionId));
      await refreshUser();
      setSubscriptionTier("premium");
      setSuccess(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upgrade failed. Please try again or contact support.";
      setError(message);
    } finally {
      setLoading(null);
    }
  };

  const handleDemoUpgrade = () => {
    setError(null);
    setSuccess(false);
    setSubscriptionTier("premium");
    setSuccess(true);
  };

  const premiumPlan = plans.find(
    (p) =>
      (p.tier ?? p.name ?? "").toLowerCase().includes("premium") ||
      (p.name ?? "").toLowerCase().includes("pro")
  );

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Pricing</h1>
          <p className="mt-2 text-muted-foreground">
            Choose the plan that fits your startup journey
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Free Tier */}
          <Card className={subscriptionTier === "free" ? "ring-2 ring-primary/50" : ""}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Free
                {subscriptionTier === "free" && (
                  <Badge variant="secondary">Current</Badge>
                )}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" disabled>
                Current plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className={cn(
            "border-primary",
            subscriptionTier === "premium" && "ring-2 ring-primary"
          )}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-xl">
                {premiumPlan?.name ?? "Premium"}
                {subscriptionTier === "premium" && (
                  <Badge variant="success">Current</Badge>
                )}
              </CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">
                  ${(premiumPlan?.price as number) ?? 29}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              {(error || success) && (
                <div
                  className={cn(
                    "rounded-lg border p-3 text-sm",
                    error && "border-destructive bg-destructive/10 text-destructive",
                    success && "border-green-500/50 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400"
                  )}
                >
                  {error ? (
                    <span className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {error}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Check className="h-4 w-4 shrink-0" />
                      You&apos;re now Premium! Enjoy full access.
                    </span>
                  )}
                </div>
              )}
              <Button
                className="w-full"
                size="lg"
                onClick={() =>
                  premiumPlan
                    ? handleSubscribe(premiumPlan.id)
                    : handleDemoUpgrade()
                }
                disabled={subscriptionTier === "premium" || loading === premiumPlan?.id}
              >
                {subscriptionTier === "premium"
                  ? "Current plan"
                  : loading === premiumPlan?.id
                    ? "Processing..."
                    : premiumPlan
                      ? "Upgrade now"
                      : "Upgrade (demo)"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
