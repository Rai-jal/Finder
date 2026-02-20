"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useOnboarding } from "@/context/OnboardingContext";
import { useStartup } from "@/context/StartupContext";
import { submitOnboarding } from "@/lib/api";
import { StepIndicator } from "@/components/forms/onboarding/StepIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select } from "@/components/ui/select";
import { COUNTRIES } from "@/lib/constants/countries";
import { ApiSelectField } from "@/components/forms/ApiSelectField";
import { ApiCheckboxGroup } from "@/components/forms/ApiCheckboxGroup";
import { getIndustries, getStages } from "@/lib/api/reference";
import { cn } from "@/lib/utils";

// Step 1 schema
const step1Schema = z.object({
  startupName: z.string().min(1, "Required"),
  description: z.string().min(1, "Required"),
  registeredBusiness: z.boolean(),
  registrationNumber: z.string().optional(),
});

// Step 2 schema
const step2Schema = z.object({
  sectors: z.array(z.string()).min(1, "Select at least one"),
  stage: z.string().min(1, "Required"),
  country: z.string().min(2, "Select your country"),
  teamSize: z.string().min(1, "Required"),
  revenueRange: z.string().min(1, "Required"),
});

// Step 3 schema
const step3Schema = z.object({
  categories: z.array(z.string()).min(1, "Select at least one"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type Step3Data = z.infer<typeof step3Schema>;

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

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboardingData, setHasCompletedOnboarding } = useOnboarding();
  const startup = useStartup();
  const [step, setStep] = useState(1);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

  const step1Form = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { registeredBusiness: false },
  });

  const step2Form = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: { sectors: [], country: "" },
  });

  const step3Form = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: { categories: [] },
  });

  const onStep1Submit = (data: Step1Data) => {
    setOnboardingData({ startupIdentity: data as never });
    if (!data.registeredBusiness) {
      setShowRegistrationModal(true);
    } else {
      setStep(2);
    }
  };

  const closeModalAndContinue = () => {
    setShowRegistrationModal(false);
    setStep(2);
  };

  const onStep2Submit = (data: Step2Data) => {
    setOnboardingData({ qualification: data as never });
    setStep(3);
  };

  const onStep3Submit = async (data: Step3Data) => {
    const fullData = {
      startupIdentity: step1Form.getValues(),
      qualification: step2Form.getValues(),
      categories: data.categories,
    };
    setOnboardingData(fullData as never);
    const result = await submitOnboarding({
      startupIdentity: step1Form.getValues() as never,
      qualification: step2Form.getValues() as never,
      categories: data.categories as never,
    });
    if (result.startupId && result.startupName && startup?.setStartup) {
      startup.setStartup(result.startupId, result.startupName);
    } else {
      await startup?.refresh();
    }
    setHasCompletedOnboarding(true);
    router.push("/dashboard");
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold">Let&apos;s set up your profile</h1>
      <p className="mb-8 text-muted-foreground">A few questions to personalize your experience</p>

      <StepIndicator currentStep={step} />

      {step === 1 && (
        <form
          onSubmit={step1Form.handleSubmit(onStep1Submit)}
          className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div>
            <Label>Startup Name</Label>
            <Input
              {...step1Form.register("startupName")}
              placeholder="Your startup name"
            />
            {step1Form.formState.errors.startupName && (
              <p className="mt-1 text-sm text-destructive">
                {step1Form.formState.errors.startupName.message}
              </p>
            )}
          </div>
          <div>
            <Label>What does your startup do?</Label>
            <Textarea
              {...step1Form.register("description")}
              placeholder="Brief description..."
              rows={4}
            />
            {step1Form.formState.errors.description && (
              <p className="mt-1 text-sm text-destructive">
                {step1Form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="registered"
              {...step1Form.register("registeredBusiness")}
              onChange={(e) =>
                step1Form.setValue("registeredBusiness", e.target.checked)
              }
            />
            <Label htmlFor="registered">Registered Business</Label>
          </div>
          {step1Form.watch("registeredBusiness") && (
            <div>
              <Label>Registration Number</Label>
              <Input
                {...step1Form.register("registrationNumber")}
                placeholder="e.g. BN1234567"
              />
            </div>
          )}
          <Button type="submit">Continue</Button>
        </form>
      )}

      {step === 2 && (
        <form
          onSubmit={step2Form.handleSubmit(onStep2Submit)}
          className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <ApiCheckboxGroup
            name="sectors"
            label="Sector"
            queryKey="industries"
            fetchOptions={async () => {
              const list = await getIndustries();
              return list.map((i) => ({ id: i.id, name: i.name }));
            }}
            value={step2Form.watch("sectors") ?? []}
            onChange={(v) => step2Form.setValue("sectors", v)}
            error={step2Form.formState.errors.sectors?.message}
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
            value={step2Form.watch("stage")}
            onChange={(v) => step2Form.setValue("stage", v)}
            error={step2Form.formState.errors.stage?.message}
            required
          />
          <div>
            <Label>Country</Label>
            <Select {...step2Form.register("country")}>
              <option value="">Select...</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </Select>
            {step2Form.formState.errors.country && (
              <p className="mt-1 text-sm text-destructive">
                {step2Form.formState.errors.country.message}
              </p>
            )}
          </div>
          <div>
            <Label>Team Size</Label>
            <Select {...step2Form.register("teamSize")}>
              <option value="">Select...</option>
              <option value="1">Solo</option>
              <option value="2-5">2-5</option>
              <option value="6-10">6-10</option>
              <option value="11-50">11-50</option>
              <option value="50+">50+</option>
            </Select>
          </div>
          <div>
            <Label>Revenue Range</Label>
            <Select {...step2Form.register("revenueRange")}>
              <option value="">Select...</option>
              <option value="pre-revenue">Pre-revenue</option>
              <option value="0-50k">$0 - $50k</option>
              <option value="50k-200k">$50k - $200k</option>
              <option value="200k-1m">$200k - $1M</option>
              <option value="1m+">$1M+</option>
            </Select>
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="submit">Continue</Button>
          </div>
        </form>
      )}

      {step === 3 && (
        <form
          onSubmit={step3Form.handleSubmit(onStep3Submit)}
          className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <div>
            <Label>What types of opportunities interest you?</Label>
            <p className="mb-3 text-sm text-muted-foreground">
              Select all that apply
            </p>
            <div className="space-y-2">
              {OPPORTUNITY_CATEGORIES.map((c) => {
                const categories = step3Form.watch("categories") || [];
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
                        step3Form.setValue("categories", next);
                      }}
                    />
                    {OPPORTUNITY_CATEGORIES_LABELS[c]}
                  </label>
                );
              })}
            </div>
            {step3Form.formState.errors.categories && (
              <p className="mt-1 text-sm text-destructive">
                {step3Form.formState.errors.categories.message}
              </p>
            )}
          </div>
          <div className="flex gap-4">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="submit">Complete Setup</Button>
          </div>
        </form>
      )}

      {showRegistrationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 max-w-md rounded-xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Consider registering your business</h3>
            <p className="mt-2 text-muted-foreground">
              Many opportunities require a registered business. You can still proceed and
              complete registration later.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" onClick={closeModalAndContinue}>
                Continue Anyway
              </Button>
              <Button onClick={() => setShowRegistrationModal(false)}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
