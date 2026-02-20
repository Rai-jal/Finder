"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search, FileCheck, FolderOpen } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const hasOnboarding =
        typeof window !== "undefined" &&
        localStorage.getItem("finder_has_completed_onboarding") === "true";
      router.replace(hasOnboarding ? "/dashboard" : "/onboarding");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top Navigation */}
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

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
          Find the right opportunities for your startup
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted-foreground">
          Discover grants, accelerators, and programs. Track applications. Manage documents—all in one place.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/auth/signup">Get started free</Link>
        </Button>
      </section>

      {/* Feature Blocks */}
      <section className="border-t border-border bg-muted/30 px-6 py-20">
        <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Discover Opportunities</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Browse grants, accelerators, competitions, and more. Filter by sector, stage, and deadline.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <FileCheck className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Track Applications</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Manage your applications in one workspace. Auto-save answers and never miss a deadline.
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/20">
              <FolderOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Document Vault</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Store and organize documents for your applications. Drag and drop, access anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Finder. Startup opportunity discovery.
          </p>
          <div className="flex gap-6">
            <Link href="/auth/login" className="text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
            <Link href="/auth/signup" className="text-sm text-muted-foreground hover:text-foreground">
              Sign up
            </Link>
            <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
