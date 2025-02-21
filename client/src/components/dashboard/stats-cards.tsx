import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Users, DollarSign, TrendingUp } from "lucide-react";

export function StatsCards() {
  const { user } = useAuth();
  const { data: referrals } = useQuery<Transaction[]>({
    queryKey: [`/api/referrals/${user?.id}`],
  });

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/${user?.id}`],
  });

  const totalEarnings = transactions?.reduce((sum, tx) => 
    tx.type === "commission" ? sum + tx.amount : sum, 0) || 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(totalEarnings / 100).toFixed(2)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Direct Referrals</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{referrals?.length || 0}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${(user?.balance || 0 / 100).toFixed(2)}</div>
        </CardContent>
      </Card>
    </div>
  );
}
