"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import { useOnboarding } from "@/context/OnboardingContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { COUNTRIES } from "@/lib/constants/countries";
import { ApiSelectField } from "@/components/forms/ApiSelectField";
import { ApiCheckboxGroup } from "@/components/forms/ApiCheckboxGroup";
import { getIndustries, getStages } from "@/lib/api/reference";
import { useStartup } from "@/context/StartupContext";
import { updateStartupProfile } from "@/lib/api";
import { cn } from "@/lib/utils";

const OPPORTUNITY_CATEGORIES_LABELS: Record<string, string> = {
  grants: "Grants",
  accelerators: "Accelerators",
  competitions: "Competitions",
  fellowships: "Fellowships",
  government_programs: "Government Programs",
  investor_events: "Investor Events",
  incubators: "Incubators",
  corporate_programs: "Corporate Programs",
};
const OPPORTUNITY_CATEGORIES = Object.keys(OPPORTUNITY_CATEGORIES_LABELS);

const profileSchema = z.object({
  startupName: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  registeredBusiness: z.boolean(),
  registrationNumber: z.string().optional(),
  sectors: z.array(z.string()).min(1, "Select at least one"),
  stage: z.string().min(1, "Required"),
  country: z.string().min(2, "Select your country"),
  teamSize: z.string().min(1, "Required"),
  revenueRange: z.string().min(1, "Required"),
  categories: z.array(z.string()).min(1, "Select at least one"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const startup = useStartup();
  const { onboardingData, updateProfileData, profileCompletionPercent } = useOnboarding();

  const [saveSuccess, setSaveSuccess] = useState(false);
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      startupName: "",
      description: "",
      registeredBusiness: false,
      registrationNumber: "",
      sectors: [],
      stage: "",
      country: "",
      teamSize: "",
      revenueRange: "",
      categories: [],
    },
  });

  useEffect(() => {
    if (!onboardingData) return;
    form.reset({
      startupName: onboardingData.startupIdentity?.startupName ?? user?.startupName ?? "",
      description: onboardingData.startupIdentity?.description ?? "",
      registeredBusiness: onboardingData.startupIdentity?.registeredBusiness ?? false,
      registrationNumber: onboardingData.startupIdentity?.registrationNumber ?? "",
      sectors: onboardingData.qualification?.sectors ?? [],
      stage: onboardingData.qualification?.stage ?? "",
      country: onboardingData.qualification?.country ?? "",
      teamSize: onboardingData.qualification?.teamSize ?? "",
      revenueRange: onboardingData.qualification?.revenueRange ?? "",
      categories: onboardingData.categories ?? [],
    });
  }, [onboardingData, user?.startupName, form]);

  const onSubmit = async (data: ProfileFormData) => {
    const payload = {
      startupIdentity: {
        startupName: data.startupName,
        description: data.description,
        registeredBusiness: data.registeredBusiness,
        registrationNumber: data.registrationNumber,
      },
      qualification: {
        sectors: data.sectors,
        stage: data.stage,
        country: data.country,
        teamSize: data.teamSize,
        revenueRange: data.revenueRange,
      },
      categories: data.categories as never[],
    };
    updateProfileData(payload);
    if (startup?.startupId) {
      try {
        await updateStartupProfile(startup.startupId, payload as never);
        await startup.refresh();
      } catch {
        // Keep local update even if API fails
      }
    }
    form.reset(data);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-8">
        <div>
          <h1 className="text-2xl font-bold">Complete Your Profile</h1>
          <p className="text-muted-foreground">
            Keep your startup details up to date for better opportunity matches
          </p>
        </div>

        {/* Profile completion indicator */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Profile strength</p>
              <span className="text-sm text-muted-foreground">
                {profileCompletionPercent}% complete
              </span>
            </div>
            <Progress value={profileCompletionPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Account (read-only) */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <p className="text-sm text-muted-foreground">Your account details</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Email</p>
              <p className="mt-1">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Subscription</p>
              <div className="mt-1">
                <Badge
                  variant={user?.subscriptionTier === "premium" ? "success" : "secondary"}
                >
                  {user?.subscriptionTier === "premium" ? "Premium" : "Free"}
                </Badge>
              </div>
              {user?.subscriptionTier === "free" && (
                <Button asChild className="mt-2">
                  <Link href="/upgrade">Upgrade to Premium</Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editable profile form - all onboarding questions */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Startup Identity */}
          <Card>
            <CardHeader>
              <CardTitle>Startup Identity</CardTitle>
              <p className="text-sm text-muted-foreground">Tell us about your startup</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Startup Name</Label>
                <Input
                  {...form.register("startupName")}
                  placeholder="Your startup name"
                />
                {form.formState.errors.startupName && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.startupName.message}
                  </p>
                )}
              </div>
              <div>
                <Label>What does your startup do?</Label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Brief description..."
                  rows={4}
                />
                {form.formState.errors.description && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="registered"
                  checked={form.watch("registeredBusiness")}
                  onChange={(e) =>
                    form.setValue("registeredBusiness", e.target.checked)
                  }
                />
                <Label htmlFor="registered">Registered Business</Label>
              </div>
              {form.watch("registeredBusiness") && (
                <div>
                  <Label>Registration Number</Label>
                  <Input
                    {...form.register("registrationNumber")}
                    placeholder="e.g. BN1234567"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Qualification Details */}
          <Card>
            <CardHeader>
              <CardTitle>Qualification Details</CardTitle>
              <p className="text-sm text-muted-foreground">Your startup stage and context</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ApiCheckboxGroup
                name="sectors"
                label="Sector"
                queryKey="industries"
                fetchOptions={async () => {
                  const list = await getIndustries();
                  return list.map((i) => ({ id: i.id, name: i.name }));
                }}
                value={form.watch("sectors") ?? []}
                onChange={(v) => form.setValue("sectors", v)}
                error={form.formState.errors.sectors?.message}
                required
              />
              <ApiSelectField
                name="stage"
                label="Startup Stage"
                queryKey="stages"
                fetchOptions={async () => {
                  const list = await getStages();
                  return list.map((s) => ({ id: s.id, name: s.name }));
                }}
                value={form.watch("stage")}
                onChange={(v) => form.setValue("stage", v)}
                error={form.formState.errors.stage?.message}
                required
              />
              <div>
                <Label>Country</Label>
                <Select
                  value={form.watch("country")}
                  onChange={(e) => form.setValue("country", e.target.value)}
                >
                  <option value="">Select...</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                {form.formState.errors.country && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Team Size</Label>
                <Select
                  value={form.watch("teamSize")}
                  onChange={(e) => form.setValue("teamSize", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="1">Solo</option>
                  <option value="2-5">2-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-50">11-50</option>
                  <option value="50+">50+</option>
                </Select>
                {form.formState.errors.teamSize && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.teamSize.message}
                  </p>
                )}
              </div>
              <div>
                <Label>Revenue Range</Label>
                <Select
                  value={form.watch("revenueRange")}
                  onChange={(e) => form.setValue("revenueRange", e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="pre-revenue">Pre-revenue</option>
                  <option value="0-50k">$0 - $50k</option>
                  <option value="50k-200k">$50k - $200k</option>
                  <option value="200k-1m">$200k - $1M</option>
                  <option value="1m+">$1M+</option>
                </Select>
                {form.formState.errors.revenueRange && (
                  <p className="mt-1 text-sm text-destructive">
                    {form.formState.errors.revenueRange.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Opportunity Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Opportunity Preferences</CardTitle>
              <p className="text-sm text-muted-foreground">
                What types of opportunities interest you?
              </p>
            </CardHeader>
            <CardContent className="space-y-2">
              {OPPORTUNITY_CATEGORIES.map((c) => {
                const categories = form.watch("categories") || [];
                const checked = categories.includes(c);
                return (
                  <label
                    key={c}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-lg border px-4 py-3",
                      checked ? "border-primary bg-accent/50" : "border-border"
                    )}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={checked}
                      onChange={() => {
                        const next = checked
                          ? categories.filter((x) => x !== c)
                          : [...categories, c];
                        form.setValue("categories", next);
                      }}
                    />
                    {OPPORTUNITY_CATEGORIES_LABELS[c]}
                  </label>
                );
              })}
              {form.formState.errors.categories && (
                <p className="mt-1 text-sm text-destructive">
                  {form.formState.errors.categories.message}
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-4">
            {saveSuccess && (
              <span className="text-sm text-primary font-medium">Profile saved successfully!</span>
            )}
            <Button type="submit" size="lg">Save Profile</Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
