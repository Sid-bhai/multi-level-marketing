import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export function WalletCard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  const depositMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest("POST", "/api/transactions", {
        userId: user!.id,
        amount,
        type: "deposit",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/transactions/${user?.id}`] });
      toast({ title: "Deposit successful" });
      setAmount("");
    },
  });

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
      toast({ title: "Withdrawal requested" });
      setAmount("");
    },
  });

  const handleTransaction = (type: "deposit" | "withdrawal") => {
    const amountCents = Math.round(parseFloat(amount) * 100);
    if (isNaN(amountCents)) {
      toast({ title: "Invalid amount", variant: "destructive" });
      return;
    }
    if (type === "deposit") {
      depositMutation.mutate(amountCents);
    } else {
      withdrawMutation.mutate(amountCents);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wallet</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-2">
          <Input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button
            onClick={() => handleTransaction("deposit")}
            disabled={depositMutation.isPending}
          >
            Deposit
          </Button>
          <Button
            onClick={() => handleTransaction("withdrawal")}
            disabled={withdrawMutation.isPending}
          >
            Withdraw
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
