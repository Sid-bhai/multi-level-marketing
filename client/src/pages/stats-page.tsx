import { MainNav } from "@/components/nav/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { TransactionDocument } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";

export default function StatsPage() {
  const { user } = useAuth();
  const { data: transactions, isLoading } = useQuery<TransactionDocument[]>({
    queryKey: [`/api/transactions/${user?._id}`],
    enabled: !!user,
  });

  const processTransactionData = () => {
    if (!transactions) return [];

    const dailyData = transactions.reduce((acc: any[], tx) => {
      const date = format(new Date(tx.createdAt), 'MMM dd');
      const existing = acc.find(d => d.date === date);

      if (existing) {
        existing.amount += tx.amount;
      } else {
        acc.push({ date, amount: tx.amount });
      }

      return acc;
    }, []);

    return dailyData.sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  const processReferralStats = () => {
    const referralIncome = transactions?.filter(tx => 
      tx.type === 'commission' && tx.status === 'completed'
    ).reduce((sum, tx) => sum + tx.amount, 0) || 0;

    return {
      totalEarnings: referralIncome,
      averageCommission: transactions?.filter(tx => tx.type === 'commission').length 
        ? (referralIncome / transactions.filter(tx => tx.type === 'commission').length)
        : 0
    };
  };

  const stats = processReferralStats();
  const chartData = processTransactionData();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <MainNav />
        <main className="container mx-auto p-4">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Statistics</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Earnings Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹${value}`} />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="hsl(var(--primary))"
                      name="Amount (₹)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referral Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Total Referral Earnings</p>
                <p className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Average Commission</p>
                <p className="text-2xl font-bold">₹{stats.averageCommission.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}