"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { useStartup } from "@/context/StartupContext";
import { useSavedOpportunities } from "@/context/SavedOpportunitiesContext";
import { getOpportunities, getApplications } from "@/lib/api";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Clock,
  Calendar,
  TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

const STAGES: Record<string, string> = {
  idea: "Idea",
  mvp: "MVP",
  early_traction: "Early Traction",
  growth: "Growth",
  scale: "Scale",
};

export default function DashboardPage() {
  const { user } = useAuth();
  const startup = useStartup();
  const { profileCompletionPercent, onboardingData } = useOnboarding();
  const { savedIds } = useSavedOpportunities();
  const [activeTab, setActiveTab] = useState<"top" | "saved">("top");

  const displayName = onboardingData?.startupIdentity?.startupName ?? user?.startupName ?? "Founder";
  const sector = onboardingData?.qualification?.sectors?.[0] ?? "your sector";
  const stage = STAGES[onboardingData?.qualification?.stage ?? ""] ?? "your stage";

  const { data: opportunities = [] } = useQuery({
    queryKey: ["opportunities", startup?.startupId],
    queryFn: () => getOpportunities({ startupId: startup?.startupId ?? undefined }),
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const recommended = opportunities
    .filter((o) => (o.matchPercent ?? 0) >= 75)
    .sort((a, b) => (b.matchPercent ?? 0) - (a.matchPercent ?? 0))
    .slice(0, 4);

  const savedOpportunities = opportunities.filter((o) => savedIds.has(o.id));
  const displayedOpportunities = activeTab === "saved" ? savedOpportunities.slice(0, 4) : recommended;

  const upcoming = [...opportunities]
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime())
    .slice(0, 4);

  const recent = opportunities.slice(-2).reverse();

  const appliedCount = applications.length;
  const awardedAmount = "—"; // Mock - could add to Application type

  const isUrgent = (dateStr: string) => {
    const deadline = new Date(dateStr);
    const now = new Date();
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 7;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Welcome & Profile Completion Card */}
        <div className="rounded-lg border border-blue-200/60 bg-blue-50/80 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                Welcome back, {displayName}! 👋
              </h1>
              <p className="mt-1 text-muted-foreground">
                {profileCompletionPercent >= 100
                  ? "Your profile is complete. Explore matched opportunities below."
                  : "Your profile is nearly complete. Finish your verification to unlock 15+ matched funding opportunities."}
              </p>
            </div>
            <div className="shrink-0 lg:w-64">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Profile Completion
                </span>
                <span className="text-sm font-semibold">{profileCompletionPercent}%</span>
              </div>
              <Progress value={profileCompletionPercent} className="mt-1 h-2" />
              <Link
                href="/profile"
                className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
              >
                {profileCompletionPercent >= 100 ? "View profile" : "Complete remaining steps"}{" "}
                <ChevronRight className="ml-0.5 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Main content: 2-column layout */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left column - Recommended */}
          <div className="flex-1 min-w-0">
            <div>
              <h2 className="text-lg font-bold">Recommended for You</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Based on your {sector} sector and {stage} stage profile.
              </p>
            </div>

            {/* Tabs */}
            <div className="mt-4 flex gap-1 border-b border-border">
              <button
                onClick={() => setActiveTab("top")}
                className={cn(
                  "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "top"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Top Matches
              </button>
              <button
                onClick={() => setActiveTab("saved")}
                className={cn(
                  "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
                  activeTab === "saved"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                Saved
              </button>
            </div>

            {/* Opportunity cards - 2x2 grid */}
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {displayedOpportunities.length > 0 ? (
                displayedOpportunities.map((o) => (
                  <OpportunityCard key={o.id} opportunity={o} variant="dashboard" />
                ))
              ) : (
                <div className="col-span-2 rounded-lg border-2 border-dashed border-border bg-muted/30 py-12 text-center text-muted-foreground">
                  {activeTab === "saved"
                    ? "No saved opportunities yet. Save some from Top Matches!"
                    : "No matches found. Complete your profile for better recommendations."}
                </div>
              )}
            </div>

            <Link
              href="/opportunities"
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              View All {opportunities.length} Matched Opportunities
            </Link>
          </div>

          {/* Right sidebar */}
          <div className="w-full shrink-0 lg:w-72 xl:w-80 space-y-6">
            {/* Upcoming Deadlines */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold">Upcoming Deadlines</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {upcoming.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/opportunities/${o.id}`}
                        className="flex items-center justify-between gap-2 text-sm hover:text-primary"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{o.title}</span>
                        </div>
                        <span
                          className={cn(
                            "shrink-0 text-xs font-medium",
                            isUrgent(o.deadline) && "text-red-600"
                          )}
                        >
                          {isUrgent(o.deadline) && (
                            <Badge variant="destructive" className="mr-1 text-[10px]">
                              URGENT
                            </Badge>
                          )}
                          {new Date(o.deadline).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/opportunities"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Open Calendar <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </CardContent>
            </Card>

            {/* Recently Added */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Recently Added
                </h3>
                <ul className="mt-4 space-y-3">
                  {recent.map((o) => (
                    <li key={o.id}>
                      <Link
                        href={`/opportunities/${o.id}`}
                        className="flex items-start gap-3 text-sm hover:text-primary"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-primary/10">
                          <TrendingUp className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium">{o.title}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {o.type} • {o.organization}
                          </p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-primary">{appliedCount}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Applied
                  </p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-6">
                  <p className="text-2xl font-bold text-primary">{awardedAmount}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Awarded
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Finder. Empowering Startup Innovation.
        </footer>
      </div>
    </DashboardLayout>
  );
}
