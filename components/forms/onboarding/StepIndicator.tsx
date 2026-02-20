"use client";

import { cn } from "@/lib/utils";

const STEPS = ["Startup Identity", "Qualification Details", "Opportunity Categories"];

export function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {STEPS.map((label, i) => (
          <div key={i} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium",
                  i < currentStep && "border-primary bg-primary text-primary-foreground",
                  i === currentStep && "border-primary bg-background text-foreground",
                  i > currentStep && "border-border bg-background text-muted-foreground"
                )}
              >
                {i < currentStep ? "✓" : i + 1}
              </div>
              <span
                className={cn(
                  "mt-2 hidden text-sm sm:block",
                  i <= currentStep ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "mx-2 h-0.5 flex-1",
                  i < currentStep ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
