import { MainNav } from "@/components/nav/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Transaction } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DollarSign } from "lucide-react";

export default function WithdrawPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: [`/api/transactions/${user?.id}`],
  });

  const pendingWithdrawals = transactions?.filter(
    tx => tx.type === "withdrawal" && tx.status === "pending"
  ) || [];

  const withdrawMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest("POST", "/api/transactions", {
        userId: user!.id,
        amount: -amount,
        type: "withdrawal",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${user?.id}`] });
      toast({ title: "Withdrawal request submitted" });
      setAmount("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Withdrawal failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleWithdraw = () => {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents)) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    withdrawMutation.mutate(amountCents);
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Withdraw Funds</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Available Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                <span className="text-2xl font-bold">
                  ₹{((user?.balance || 0) / 100).toFixed(2)}
                </span>
              </div>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Amount to withdraw"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <Button 
                  onClick={handleWithdraw}
                  disabled={withdrawMutation.isPending}
                >
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingWithdrawals.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">
                        ₹{(Math.abs(withdrawal.amount) / 100).toFixed(2)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(withdrawal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                      Pending
                    </span>
                  </div>
                ))}
                {pendingWithdrawals.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No pending withdrawals
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}