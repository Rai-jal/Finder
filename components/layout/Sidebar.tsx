"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  FileCheck,
  FolderOpen,
  User,
  Zap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function LogoutButton() {
  const { logout } = useAuth();
  return (
    <button
      onClick={() => logout()}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/80 hover:text-foreground"
    >
      <LogOut className="h-4 w-4 shrink-0" />
      Logout
    </button>
  );
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/opportunities", label: "Opportunities", icon: Search },
  { href: "/applications", label: "My Applications", icon: FileCheck },
  { href: "/documents", label: "Documents", icon: FolderOpen },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-56 flex-col border-r border-border bg-[#f5f5f5]">
      <div className="flex-1 overflow-y-auto p-3">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-white text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-white/80 hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Upgrade / Pro Card */}
        <div className="mt-6 rounded-lg bg-primary px-4 py-4 text-primary-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Finder Pro
            </span>
          </div>
          <p className="mt-2 text-xs leading-snug opacity-95">
            Unlock smart autofill and exclusive funding leads.
          </p>
          <Button
            size="sm"
            className="mt-3 w-full bg-white text-primary hover:bg-white/90"
            asChild
          >
            <Link href="/upgrade">Upgrade Now</Link>
          </Button>
        </div>
      </div>

      {/* Bottom section */}
      <div className="border-t border-border p-3">
        <LogoutButton />
        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          Made with Finder
        </p>
      </div>
    </aside>
  );
}
