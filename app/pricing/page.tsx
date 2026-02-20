"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

const FREE_FEATURES = [
  "Browse opportunities",
  "Basic search and filters",
  "Save opportunities",
  "Limited opportunity details",
];

const PREMIUM_FEATURES = [
  "Full eligibility criteria",
  "Required documents list",
  "Application questions preview",
  "Application workspace with auto-save",
  "Export applications to PDF",
  "Priority support",
];

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-border bg-card px-6 shadow-sm">
        <Link href="/" className="text-xl font-bold text-foreground">
          Finder
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/signup">Sign up</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-1 flex-col items-center px-6 py-16">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-2 text-center text-muted-foreground">
          Choose the plan that fits your startup journey
        </p>

        <div className="mt-12 grid w-full gap-6 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {FREE_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signup">Get started free</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <div className="mt-2">
                <span className="text-3xl font-bold">$29</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <ul className="space-y-3">
                {PREMIUM_FEATURES.map((f, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-5 w-5 shrink-0 text-primary" />
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" size="lg" asChild>
                <Link href="/auth/signup">Sign up for Premium</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t border-border px-6 py-6">
        <div className="mx-auto flex max-w-5xl justify-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Back to home
          </Link>
        </div>
      </footer>
    </div>
  );
}
