"use client";

import Link from "next/link";
import { Calendar, Bookmark, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSavedOpportunities } from "@/context/SavedOpportunitiesContext";
import type { Opportunity } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_COLORS: Record<string, string> = {
  Grant: "bg-emerald-100 text-emerald-800",
  Funding: "bg-emerald-100 text-emerald-800",
  Accelerator: "bg-blue-100 text-blue-800",
  Competition: "bg-amber-100 text-amber-800",
  Fellowship: "bg-violet-100 text-violet-800",
  "Government Program": "bg-slate-100 text-slate-800",
  "Investor Event": "bg-cyan-100 text-cyan-800",
  Incubator: "bg-purple-100 text-purple-800",
  "Corporate Program": "bg-indigo-100 text-indigo-800",
  Workspace: "bg-purple-100 text-purple-800",
};

interface OpportunityCardProps {
  opportunity: Opportunity;
  variant?: "default" | "dashboard";
}

export function OpportunityCard({ opportunity, variant = "default" }: OpportunityCardProps) {
  const { isSaved, toggleSaved } = useSavedOpportunities();

  const saved = isSaved(opportunity.id);
  const deadline = new Date(opportunity.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const deadlineShort = new Date(opportunity.deadline).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const typeColor = TYPE_COLORS[opportunity.type] ?? "bg-muted text-muted-foreground";
  const matchPercent = opportunity.matchPercent ?? 0;

  if (variant === "dashboard") {
    return (
      <Card className="flex flex-col transition-shadow hover:shadow-md">
        <CardContent className="flex-1 pt-5">
          <div className="flex items-start justify-between gap-2">
            <Badge className={cn("text-xs", typeColor)}>{opportunity.type}</Badge>
            <button
              onClick={(e) => {
                e.preventDefault();
                toggleSaved(opportunity.id);
              }}
              className={cn(
                "shrink-0 rounded p-1 transition-colors hover:bg-muted",
                saved && "text-amber-500"
              )}
            >
              <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
            </button>
          </div>
          <h3 className="mt-3 font-semibold">{opportunity.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{opportunity.organization}</p>

          <div className="mt-4 space-y-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Match Score
              </p>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={matchPercent} className="h-1.5 flex-1" />
                <span className="text-sm font-semibold">{matchPercent}%</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Deadline
              </p>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                {deadlineShort}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button asChild variant="default" className="w-full" size="sm">
            <Link href={`/opportunities/${opportunity.id}`}>
              View Details <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex-1 pt-6">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary">{opportunity.type}</Badge>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => toggleSaved(opportunity.id)}
            className={cn("shrink-0", saved && "text-amber-500")}
          >
            <Bookmark className={cn("h-5 w-5", saved && "fill-current")} />
          </Button>
        </div>
        <h3 className="mt-3 text-lg font-semibold">{opportunity.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{opportunity.organization}</p>
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {opportunity.shortDescription}
        </p>
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {deadline}
        </div>
        {opportunity.matchPercent !== undefined && (
          <p className="mt-2 text-sm font-medium text-primary">
            {opportunity.matchPercent}% match
          </p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 border-t pt-4">
        <Button asChild variant="default" className="flex-1">
          <Link href={`/opportunities/${opportunity.id}`}>View details</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
