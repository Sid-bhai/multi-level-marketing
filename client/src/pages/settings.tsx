import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Bell, Moon, Sun } from "lucide-react";
import { useState } from "react";

export default function Settings() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleNotificationChange = (checked: boolean) => {
    setNotifications(checked);
    toast({
      title: checked ? "Notifications enabled" : "Notifications disabled",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleThemeChange = (checked: boolean) => {
    setDarkMode(checked);
    // Implement theme change logic here
    document.documentElement.classList.toggle("dark", checked);
    toast({
      title: checked ? "Dark mode enabled" : "Light mode enabled",
      description: "Your theme preferences have been updated.",
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>
            Manage your application preferences and notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="notifications">Notifications</Label>
              <div className="text-sm text-muted-foreground">
                Receive notifications about your team updates.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={handleNotificationChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="theme">Dark Mode</Label>
              <div className="text-sm text-muted-foreground">
                Toggle between light and dark theme.
              </div>
            </div>
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
              <Switch
                id="theme"
                checked={darkMode}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </div>

          <div className="mt-6">
            <Button
              variant="destructive"
              onClick={() => {
                toast({
                  title: "Settings Reset",
                  description: "All settings have been reset to default.",
                });
                setNotifications(true);
                setDarkMode(false);
              }}
            >
              Reset All Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
