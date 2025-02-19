import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, Mail } from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";

interface Notification {
  id: number;
  userId: number;
  subject: string;
  message: string;
  htmlContent?: string;
  createdAt: string;
  read: boolean;
}

export default function Notifications() {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const { data: notifications = [], isLoading } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px] pr-4">
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer hover:bg-accent transition-colors ${!notification.read ? 'border-primary' : ''}`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Mail className="h-4 w-4 text-primary" />
                          )}
                          <h3 className="font-semibold">{notification.subject}</h3>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(notification.createdAt), "PPp")}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedNotification?.subject}
            </DialogTitle>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {selectedNotification && format(new Date(selectedNotification.createdAt), "PPPP 'at' p")}
              </span>
            </div>
          </DialogHeader>
          <div className="mt-4">
            {selectedNotification?.htmlContent ? (
              <div 
                dangerouslySetInnerHTML={{ __html: selectedNotification.htmlContent }}
                className="prose prose-sm max-w-none"
              />
            ) : (
              <p className="whitespace-pre-wrap">{selectedNotification?.message}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}