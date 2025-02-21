import { MainNav } from "@/components/nav/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Bell, Shield, Moon, Sun, Monitor } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Theme = {
  appearance: "light" | "dark" | "system";
};

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    twoFactorAuth: false,
  });
  const [theme, setTheme] = useState<Theme>({ appearance: "system" });

  useEffect(() => {
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme({ appearance: savedTheme as Theme["appearance"] });
      document.documentElement.classList.remove("light", "dark");
      if (savedTheme !== "system") {
        document.documentElement.classList.add(savedTheme);
      } else {
        // Handle system preference
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.add("light");
        }
      }
    }
  }, []);

  const updateTheme = (appearance: Theme["appearance"]) => {
    setTheme({ appearance });
    localStorage.setItem("theme", appearance);
    document.documentElement.classList.remove("light", "dark");

    if (appearance === "system") {
      // Handle system preference
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.add("light");
      }
    } else {
      document.documentElement.classList.add(appearance);
    }
  };

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: typeof settings) => {
      await apiRequest("PATCH", `/api/users/${user!.id}/settings`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Settings updated successfully" });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update settings",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Settings</h1>

        <Card>
          <CardHeader>
            <CardTitle>Theme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  {theme.appearance === "dark" ? (
                    <Moon className="mr-2 h-4 w-4" />
                  ) : theme.appearance === "light" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Monitor className="mr-2 h-4 w-4" />
                  )}
                  <h2 className="text-base font-medium">Appearance</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Customize your theme preference
                </p>
              </div>
              <Select
                value={theme.appearance}
                onValueChange={(value) => updateTheme(value as Theme["appearance"])}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center">
                      <Sun className="mr-2 h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center">
                      <Moon className="mr-2 h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center">
                      <Monitor className="mr-2 h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Bell className="mr-2 h-4 w-4" />
                  <h2 className="text-base font-medium">Email Notifications</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications about your account activity
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, emailNotifications: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center">
                  <Shield className="mr-2 h-4 w-4" />
                  <h2 className="text-base font-medium">Two-Factor Authentication</h2>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({ ...prev, twoFactorAuth: checked }))
                }
              />
            </div>

            <Button
              onClick={() => updateSettingsMutation.mutate(settings)}
              disabled={updateSettingsMutation.isPending}
              className="w-full"
            >
              Save Settings
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}