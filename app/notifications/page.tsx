"use client";

import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useNotifications } from "@/context/NotificationContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-muted-foreground">
              Stay updated on opportunities and deadlines
            </p>
          </div>
          {notifications.length > 0 && notifications.some((n) => !n.read) && (
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
              Mark all as read
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="p-0">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Bell className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((n) => (
                  <button
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={cn(
                      "w-full px-6 py-4 text-left transition-colors",
                      !n.read && "bg-accent/20"
                    )}
                  >
                    <p className="font-medium">{n.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {n.message}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
