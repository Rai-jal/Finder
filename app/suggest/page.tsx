"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { suggestOpportunity } from "@/lib/api";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Lightbulb } from "lucide-react";

const schema = z.object({
  grant_name: z.string().min(1, "Grant or opportunity name is required"),
  url: z.union([z.string().url("Must be a valid URL"), z.literal("")]),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function SuggestPage() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { grant_name: "", url: "", description: "" },
  });

  const onSubmit = async (data: FormData) => {
    await suggestOpportunity({
      grant_name: data.grant_name,
      url: data.url || undefined,
      description: data.description || undefined,
    });
    setSubmitted(true);
    form.reset();
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Suggest an Opportunity</h1>
          <p className="text-muted-foreground">
            Know a funding opportunity we don&apos;t have? Help the community by submitting it.
          </p>
        </div>

        {submitted ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Lightbulb className="h-6 w-6" />
              </div>
              <p className="mt-4 font-medium">Thank you for your suggestion!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Our team will review it and add it to the platform if it fits.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setSubmitted(false)}
              >
                Submit another
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Opportunity details</CardTitle>
              <p className="text-sm text-muted-foreground">
                Provide as much information as you can
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="grant_name">Grant or opportunity name *</Label>
                  <Input
                    id="grant_name"
                    placeholder="e.g. Tech Growth Grant 2025"
                    {...form.register("grant_name")}
                  />
                  {form.formState.errors.grant_name && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.grant_name.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="url">URL (optional)</Label>
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://..."
                    {...form.register("url")}
                  />
                  {form.formState.errors.url && (
                    <p className="mt-1 text-sm text-destructive">
                      {form.formState.errors.url.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the opportunity..."
                    rows={4}
                    {...form.register("description")}
                  />
                </div>
                <Button type="submit">Submit suggestion</Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
