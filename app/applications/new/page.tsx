"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { createApplication, getOpportunity } from "@/lib/api";

function NewApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const opportunityId = searchParams.get("opportunity") ?? "";
  const [created, setCreated] = useState(false);

  const { data: opportunity } = useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: () => getOpportunity(opportunityId),
    enabled: !!opportunityId,
  });

  useEffect(() => {
    if (!opportunityId) {
      router.replace("/opportunities");
      return;
    }
    if (!opportunity || created) return;
    createApplication(opportunityId, opportunity.title).then((app) => {
      setCreated(true);
      router.replace(`/applications/${app.id}`);
    });
  }, [opportunityId, opportunity, created, router]);

  if (!opportunityId) return null;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center py-24">
        <p className="text-muted-foreground">Creating application...</p>
      </div>
    </DashboardLayout>
  );
}

export default function NewApplicationPage() {
  return (
    <Suspense fallback={
      <DashboardLayout>
        <div className="flex items-center justify-center py-24">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    }>
      <NewApplicationContent />
    </Suspense>
  );
}
