import { QueryClientProvider } from "@tanstack/react-query";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import AdminPage from "@/pages/admin-page";
import InboxPage from "@/pages/inbox-page";
import WithdrawPage from "@/pages/withdraw-page";
import ProfilePage from "@/pages/profile-page";
import SettingsPage from "@/pages/settings-page";
import SupportPage from "@/pages/support-page";
import { useEffect } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={DashboardPage} />
      <ProtectedRoute path="/admin" component={AdminPage} />
      <ProtectedRoute path="/inbox" component={InboxPage} />
      <ProtectedRoute path="/withdraw" component={WithdrawPage} />
      <ProtectedRoute path="/profile" component={ProfilePage} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <ProtectedRoute path="/support" component={SupportPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem("theme") || "system";
    document.documentElement.classList.remove("light", "dark");

    if (savedTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.add(savedTheme);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;