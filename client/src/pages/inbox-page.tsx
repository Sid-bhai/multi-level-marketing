import { MainNav } from "@/components/nav/main-nav";
import { useQuery } from "@tanstack/react-query";
import { NotificationDocument } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";

export default function InboxPage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const { data: notifications, isLoading } = useQuery<NotificationDocument[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user
  });

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/auth" />;
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Inbox</h1>

        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-muted-foreground">Loading notifications...</p>
            </div>
          ) : notifications?.length ? (
            notifications.map((notification) => (
              <Card key={notification._id.toString()}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <Bell className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{notification.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none dark:prose-invert"
                    dangerouslySetInnerHTML={{ __html: notification.message }}
                  />
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No notifications yet
            </div>
          )}
        </div>
      </main>
    </div>
  );
}