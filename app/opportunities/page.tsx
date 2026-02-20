"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronDown, ChevronUp } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getOpportunities } from "@/lib/api";
import { OpportunityCard } from "@/components/opportunity/OpportunityCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useReferenceData } from "@/lib/hooks/useReferenceData";
import { useStartup } from "@/context/StartupContext";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// API funding_type enum (GrowFast): grant, equity, debt, prize, other
const FUNDING_TYPES = [
  { value: "grant", label: "Grant" },
  { value: "equity", label: "Equity" },
  { value: "debt", label: "Debt" },
  { value: "prize", label: "Prize" },
  { value: "other", label: "Other" },
];

export default function OpportunitiesPage() {
  const { industries, stages } = useReferenceData();
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [sectorFilter, setSectorFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [closingSoon, setClosingSoon] = useState(false);

  const startup = useStartup();
  const { data: opportunities = [], isLoading } = useQuery({
    queryKey: ["opportunities", search, typeFilter, sectorFilter, stageFilter, closingSoon, startup?.startupId],
    queryFn: () =>
      getOpportunities({
        search: search || undefined,
        type: typeFilter || undefined,
        sector: sectorFilter || undefined,
        stage: stageFilter || undefined,
        closingSoon: closingSoon || undefined,
        startupId: startup?.startupId ?? undefined,
      }),
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Opportunities</h1>
          <p className="text-muted-foreground">
            Discover and save opportunities for your startup
          </p>
        </div>

        {/* Search + Filters */}
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="sm:w-auto"
            >
              Filters {filtersOpen ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
            </Button>
          </div>

          {filtersOpen && (
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Type</label>
                  <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All types</option>
                    {FUNDING_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Sector</label>
                  <Select value={sectorFilter} onChange={(e) => setSectorFilter(e.target.value)}>
                    <option value="">All sectors</option>
                    {industries.map((s) => (
                      <option key={s.id} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Stage</label>
                  <Select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)}>
                    <option value="">All stages</option>
                    {stages.map((s) => (
                      <option key={s.id} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="flex items-end">
                  <label className="flex cursor-pointer items-center gap-2">
                    <Checkbox
                      checked={closingSoon}
                      onChange={(e) => setClosingSoon(e.target.checked)}
                    />
                    <span className="text-sm">Closing soon (30 days)</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {opportunities.map((o) => (
              <OpportunityCard key={o.id} opportunity={o} />
            ))}
          </div>
        )}
        {!isLoading && opportunities.length === 0 && (
          <p className="text-center text-muted-foreground">No opportunities found</p>
        )}
      </div>
    </DashboardLayout>
  );
}
