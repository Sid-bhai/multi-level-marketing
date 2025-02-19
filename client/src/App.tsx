import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Login from "@/pages/login";
import Register from "@/pages/register";
import AdminLogin from "@/pages/admin-login";
import AdminDashboard from "@/pages/admin-dashboard";
import NotFound from "@/pages/not-found";
import Withdraw from "@/pages/withdraw";
import Notifications from "@/pages/notifications";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { User } from "@shared/schema";
import { useEffect } from "react";
import AdminWithdrawals from "@/pages/admin-withdrawals";
import AdminPayments from "@/pages/admin-payments";

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const [, navigate] = useLocation();
  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false
  });

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const [, navigate] = useLocation();
  const { data: isAdmin = false, isLoading, isError } = useQuery<boolean>({
    queryKey: ["/api/admin/check"],
    retry: false,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    gcTime: 0
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      navigate("/admin-login");
    }
  }, [isLoading, isAdmin, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (isError || !isAdmin) {
    return null;
  }

  return <Component />;
}

function HomeRedirect() {
  const [, navigate] = useLocation();

  useEffect(() => {
    navigate("/dashboard");
  }, [navigate]);

  return null;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/admin-login" component={AdminLogin} />
      <Route path="/admin-dashboard">
        <AdminRoute component={AdminDashboard} />
      </Route>
      <Route path="/admin/withdrawals">
        <AdminRoute component={AdminWithdrawals} />
      </Route>
      <Route path="/admin/payments">
        <AdminRoute component={AdminPayments} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/profile">
        <ProtectedRoute component={Profile} />
      </Route>
      <Route path="/settings">
        <ProtectedRoute component={Settings} />
      </Route>
      <Route path="/withdraw">
        <ProtectedRoute component={Withdraw} />
      </Route>
      <Route path="/notifications">
        <ProtectedRoute component={Notifications} />
      </Route>
      <Route path="/" component={HomeRedirect} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}