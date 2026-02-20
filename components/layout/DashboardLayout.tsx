"use client";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useOnboardingRedirect } from "@/lib/hooks/useOnboardingRedirect";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  useOnboardingRedirect();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="pl-56">
          <Navbar />
          <main className="min-h-[calc(100vh-3.5rem)] bg-white p-6">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
