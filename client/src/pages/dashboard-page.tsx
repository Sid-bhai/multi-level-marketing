import { MainNav } from "@/components/nav/main-nav";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { WalletCard } from "@/components/dashboard/wallet-card";
import { ReferralTree } from "@/components/dashboard/referral-tree";
import { useAuth } from "@/hooks/use-auth";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Welcome, {user?.username}!</h1>
        </div>

        <StatsCards />

        <div className="grid gap-6 md:grid-cols-2">
          <WalletCard />
          <ReferralTree />
        </div>
      </main>
    </div>
  );
}
