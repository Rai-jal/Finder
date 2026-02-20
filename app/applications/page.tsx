"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getApplications } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileEdit } from "lucide-react";

export default function ApplicationsPage() {
  const { data: applications = [], isLoading } = useQuery({
    queryKey: ["applications"],
    queryFn: getApplications,
  });

  const drafts = applications.filter((a) => a.status === "draft");
  const completed = applications.filter((a) => a.status === "completed");

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My Applications</h1>
          <p className="text-muted-foreground">Track and manage your opportunity applications</p>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : (
          <>
            {drafts.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">Drafts</h2>
                <div className="space-y-4">
                  {drafts.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                            <FileEdit className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{app.opportunityTitle}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="secondary">Draft</Badge>
                              <span className="text-sm text-muted-foreground">
                                {app.progressPercent}% complete
                              </span>
                            </div>
                          </div>
                        </div>
                        <Progress value={app.progressPercent} className="mr-4 w-24" />
                        <Button asChild>
                          <Link href={`/applications/${app.id}`}>Continue Editing</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completed.length > 0 && (
              <div>
                <h2 className="mb-4 text-lg font-semibold">Completed</h2>
                <div className="space-y-4">
                  {completed.map((app) => (
                    <Card key={app.id}>
                      <CardContent className="flex items-center justify-between p-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
                            <FileEdit className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{app.opportunityTitle}</p>
                            <Badge variant="success" className="mt-1">
                              Submitted
                            </Badge>
                          </div>
                        </div>
                        <Button variant="outline" asChild>
                          <Link href={`/applications/${app.id}`}>View</Link>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {applications.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <p className="text-muted-foreground">No applications yet</p>
                  <Button asChild className="mt-4">
                    <Link href="/opportunities">Browse opportunities</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
