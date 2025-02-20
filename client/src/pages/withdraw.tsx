import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, IndianRupee } from "lucide-react";
import type { WithdrawalRequest } from "@shared/schema";
import { withdrawalRequestSchema } from "@shared/schema";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";

export default function Withdraw() {
  const { toast } = useToast();

  // Get user data including balance
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  // Get user's withdrawal requests
  const { data: withdrawalRequests = [] } = useQuery<WithdrawalRequest[]>({
    queryKey: ["/api/withdrawals"],
  });

  const form = useForm({
    resolver: zodResolver(withdrawalRequestSchema),
    defaultValues: {
      amount: 0,
      upiId: "",
    },
  });

  const withdrawalMutation = useMutation({
    mutationFn: async (data: { amount: number; upiId: string }) => {
      const response = await fetch("/api/withdrawals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to submit withdrawal request");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request submitted successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: { amount: number; upiId: string }) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please login to submit withdrawal request",
        variant: "destructive",
      });
      return;
    }

    withdrawalMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBack={true} />
      <div className="container mx-auto p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IndianRupee className="h-5 w-5" />
              Withdraw Funds
            </CardTitle>
            <CardDescription>
              Current Balance: ₹{user?.balance?.toFixed(2) || "0.00"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>UPI ID</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="name@bank" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={withdrawalMutation.isPending}
                >
                  {withdrawalMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Withdrawal Request"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdrawal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {withdrawalRequests.length === 0 ? (
                <p className="text-center text-muted-foreground">
                  No withdrawal requests yet
                </p>
              ) : (
                withdrawalRequests.map((request) => (
                  <Card key={request.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">₹{request.amount.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            UPI: {request.upiId}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.createdAt), "PPp")}
                          </p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-sm ${
                          request.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}