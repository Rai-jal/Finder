"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, Download, Trash2, AlertCircle, RefreshCw } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getDocuments, uploadDocument, deleteDocument } from "@/lib/api";
import { useStartup } from "@/context/StartupContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatSize(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const startup = useStartup();
  const { hasCompletedOnboarding, onboardingData } = useOnboarding();
  const startupId = startup?.startupId ?? null;
  const startupLoading = startup?.isLoading ?? true;
  const [isRetrying, setIsRetrying] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleRetry = useCallback(async () => {
    if (!startup?.refresh) return;
    setIsRetrying(true);
    setCreateError(null);
    try {
      await startup.refresh();
    } finally {
      setIsRetrying(false);
    }
  }, [startup]);

  const startupNameFromProfile = onboardingData?.startupIdentity?.startupName ?? "";

  const handleCreateStartup = useCallback(async () => {
    const name = startupNameFromProfile || "My Startup";
    if (!startup?.ensureStartup) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      await startup.ensureStartup(name);
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Failed to create startup");
    } finally {
      setIsCreating(false);
    }
  }, [startup, startupNameFromProfile]);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["documents", startupId ?? "none"],
    queryFn: () => getDocuments(startupId),
    enabled: !!startupId,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDocument(startupId, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocument(startupId ?? null, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (!startupId) return;
      const files = e.dataTransfer.files;
      if (files.length) {
        for (let i = 0; i < files.length; i++) {
          uploadMutation.mutate(files[i]!);
        }
      }
    },
    [uploadMutation, startupId]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!startupId) return;
    const files = e.target.files;
    if (files?.length) {
      for (let i = 0; i < files.length; i++) {
        uploadMutation.mutate(files[i]!);
      }
    }
    e.target.value = "";
  };

  const canUpload = !!startupId && !startupLoading;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Document Vault</h1>
          <p className="text-muted-foreground">Store and manage documents for your applications</p>
        </div>

        {!canUpload && (
          <Card className="border-amber-200 bg-amber-50/80">
            <CardContent className="flex items-start gap-3 pt-6">
              <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-900">
                  {startupLoading
                    ? "Loading your profile..."
                    : hasCompletedOnboarding
                      ? "Having trouble loading your startup"
                      : "Complete onboarding to upload documents"}
                </p>
                <p className="mt-1 text-sm text-amber-800">
                  {startupLoading
                    ? "Please wait..."
                    : hasCompletedOnboarding
                      ? "Your startup may not exist yet on the server. Click Retry to reload, or Create startup from profile to create one using your saved profile data."
                      : "Documents are linked to your startup profile. Finish the onboarding steps first."}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {!startupLoading && hasCompletedOnboarding && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRetry}
                        disabled={isRetrying || isCreating}
                      >
                        <RefreshCw className={`mr-1.5 h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
                        {isRetrying ? "Retrying..." : "Retry"}
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={handleCreateStartup}
                        disabled={isRetrying || isCreating}
                      >
                        {isCreating ? "Creating..." : "Create startup from profile"}
                      </Button>
                    </>
                  )}
                  {!startupLoading && !hasCompletedOnboarding && (
                    <Button asChild variant="outline" size="sm">
                      <Link href="/onboarding">Go to onboarding</Link>
                    </Button>
                  )}
                  {hasCompletedOnboarding && (
                    <Button asChild variant="ghost" size="sm">
                      <Link href="/profile">View profile</Link>
                    </Button>
                  )}
                </div>
                {createError && (
                  <p className="mt-2 text-sm text-red-600">{createError}</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "rounded-xl border-2 border-dashed p-12 text-center transition-colors",
            !canUpload && "pointer-events-none opacity-60 border-border bg-muted/30",
            canUpload && (isDragging ? "border-primary bg-accent/30" : "border-border bg-muted/30")
          )}
        >
          <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 font-medium">
            {canUpload ? "Drag and drop files here" : "Upload unavailable"}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {canUpload ? "or" : "Complete onboarding first"}
          </p>
          {canUpload && (
            <label className="mt-4 inline-block cursor-pointer">
              <input
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
              <span className="inline-flex h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                Browse files
              </span>
            </label>
          )}
        </div>

        {uploadMutation.isError && (
          <p className="text-sm text-destructive">
            Upload failed: {uploadMutation.error instanceof Error ? uploadMutation.error.message : "Please try again"}
          </p>
        )}

        {/* File list */}
        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : documents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No documents yet. Upload your first document above.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between px-6 py-4"
                  >
                    <div>
                      <p className="font-medium">{doc.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Uploaded {formatDate(doc.uploadDate)}
                        {doc.size ? ` • ${formatSize(doc.size)}` : ""}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => deleteMutation.mutate(doc.id)}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
