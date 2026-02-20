"use client";

import { use, useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Upload, FileDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getApplication, getOpportunity, saveApplication } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

const MAX_CHARS = 500;

const DEFAULT_APPLICATION_QUESTIONS = [
  "Tell us about your startup and what it does.",
  "What problem does your solution address, and who is your target market?",
  "How will you use this funding, and what milestones will you achieve?",
];

export default function ApplicationWorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { subscriptionTier } = useAuth();
  const queryClient = useQueryClient();
  const [localAnswers, setLocalAnswers] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const { data: application, isLoading: appLoading } = useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplication(id),
  });

  const opportunityId = application?.opportunityId ?? "";
  const { data: opportunity } = useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: () => getOpportunity(opportunityId),
    enabled: !!opportunityId,
  });

  const saveMutation = useMutation({
    mutationFn: (answers: Record<string, string>) =>
      saveApplication(id, answers),
    onSuccess: (data) => {
      queryClient.setQueryData(["application", id], data);
      setLocalAnswers(data.answers);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    },
  });

  const handleAutoSave = useCallback(() => {
    if (Object.keys(localAnswers).length > 0) {
      saveMutation.mutate(localAnswers);
    }
  }, [localAnswers, saveMutation]);

  // Initialize local answers from application
  const answers = { ...application?.answers, ...localAnswers };
  const questions =
    application?.applicationQuestions ?? opportunity?.applicationQuestions ?? DEFAULT_APPLICATION_QUESTIONS;
  const isPremium = subscriptionTier === "premium";

  if (appLoading || !application) {
    return (
      <DashboardLayout>
        <p className="text-muted-foreground">Loading...</p>
      </DashboardLayout>
    );
  }

  if (!isPremium) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-8 text-center">
          <p className="font-medium">Premium feature</p>
          <p className="mt-2 text-muted-foreground">
            Upgrade to Premium to access the application workspace
          </p>
          <Button className="mt-4" asChild>
            <a href="/upgrade">Upgrade</a>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const progressPercent = questions.length
    ? Math.min(
        100,
        (Object.keys(answers).filter((k) => answers[k]?.trim()).length /
          questions.length) *
          100
      )
    : application.progressPercent;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Left panel - Question list */}
        <div className="w-full lg:w-72 xl:w-80">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{application.opportunityTitle}</CardTitle>
              <Progress value={progressPercent} className="mt-2" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progressPercent)}% complete
              </p>
            </CardHeader>
            <CardContent>
              <nav className="space-y-1">
                {questions.map((q, i) => (
                  <a
                    key={i}
                    href={`#q-${i}`}
                    className={cn(
                      "block rounded-lg px-3 py-2 text-sm",
                      answers[`q${i}`]?.trim()
                        ? "bg-emerald-50 text-emerald-800"
                        : "text-muted-foreground hover:bg-accent/30"
                    )}
                  >
                    Q{i + 1}: {q.slice(0, 40)}...
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Right panel - Editor */}
        <div className="flex-1">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Application answers</CardTitle>
              <div className="flex items-center gap-2">
                {lastSaved && (
                  <span className="text-xs text-muted-foreground">
                    Saved {lastSaved.toLocaleTimeString()}
                  </span>
                )}
                {hasUnsavedChanges && (
                  <span className="text-xs text-amber-600">Unsaved changes</span>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleAutoSave}
                  disabled={saveMutation.isPending || !hasUnsavedChanges}
                >
                  <Save className="mr-1 h-4 w-4" />
                  Save
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {questions.map((q, i) => (
                <div key={i} id={`q-${i}`}>
                  <label className="block font-medium">{q}</label>
                  <Textarea
                    className="mt-2 min-h-[120px]"
                    placeholder="Type your answer..."
                    value={answers[`q${i}`] ?? ""}
                    onChange={(e) => {
                      const val = e.target.value.slice(0, MAX_CHARS);
                      setLocalAnswers((prev) => ({
                        ...prev,
                        [`q${i}`]: val,
                      }));
                      setHasUnsavedChanges(true);
                    }}
                    maxLength={MAX_CHARS}
                  />
                  <p className="mt-1 text-right text-xs text-muted-foreground">
                    {(answers[`q${i}`]?.length ?? 0)}/{MAX_CHARS}
                  </p>
                </div>
              ))}

              <div className="flex flex-wrap gap-2 pt-4">
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload document
                </Button>
                <Button variant="outline" size="sm">
                  <FileDown className="mr-2 h-4 w-4" />
                  Export PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
