"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { getOpportunity } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSavedOpportunities } from "@/context/SavedOpportunitiesContext";
import { Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { subscriptionTier } = useAuth();
  const { isSaved, toggleSaved } = useSavedOpportunities();

  const { data: opportunity, isLoading } = useQuery({
    queryKey: ["opportunity", id],
    queryFn: () => getOpportunity(id),
  });

  if (isLoading || !opportunity) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading...</p>
      </DashboardLayout>
    );
  }

  const saved = isSaved(opportunity.id);
  const deadline = new Date(opportunity.deadline).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const isPremium = subscriptionTier === "premium";

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{opportunity.type}</Badge>
              {opportunity.matchPercent !== undefined && (
                <Badge variant="success">{opportunity.matchPercent}% match</Badge>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold">{opportunity.title}</h1>
            <p className="mt-1 text-muted-foreground">{opportunity.organization}</p>
            <p className="mt-2 text-sm text-muted-foreground">Deadline: {deadline}</p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => toggleSaved(opportunity.id)}
            className={cn("shrink-0", saved && "text-amber-500")}
          >
            <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold">Short description</h3>
            <p className="mt-2 text-muted-foreground">{opportunity.shortDescription}</p>
            <h3 className="mt-6 font-semibold">Summary</h3>
            <p className="mt-2 text-muted-foreground">{opportunity.summary}</p>
          </CardContent>
        </Card>

        {/* Premium section */}
        <div className="relative">
          {!isPremium && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-xl border border-border bg-card/95 p-8 backdrop-blur-sm">
              <Lock className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-center font-medium">Premium content</p>
              <p className="mt-1 text-center text-sm text-muted-foreground">
                Upgrade to access full eligibility, required documents, and application
                questions
              </p>
              <Button asChild className="mt-4">
                <Link href="/upgrade">Upgrade to Premium</Link>
              </Button>
            </div>
          )}
          <Card className={cn(!isPremium && "opacity-60")}>
            <CardHeader>
              <CardTitle>Full details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {opportunity.eligibility && (
                <div>
                  <h4 className="font-medium">Eligibility</h4>
                  <p className="mt-1 text-muted-foreground">{opportunity.eligibility}</p>
                </div>
              )}
              {opportunity.requiredDocuments && opportunity.requiredDocuments.length > 0 && (
                <div>
                  <h4 className="font-medium">Required documents</h4>
                  <ul className="mt-1 list-disc space-y-1 pl-4 text-muted-foreground">
                    {opportunity.requiredDocuments.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {opportunity.applicationQuestions && opportunity.applicationQuestions.length > 0 && (
                <div>
                  <h4 className="font-medium">Application questions</h4>
                  <ol className="mt-1 list-decimal space-y-2 pl-4 text-muted-foreground">
                    {opportunity.applicationQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ol>
                </div>
              )}
              {isPremium && (
                <Button asChild>
                  <Link href={`/applications/new?opportunity=${opportunity.id}`}>
                    Start Application
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
