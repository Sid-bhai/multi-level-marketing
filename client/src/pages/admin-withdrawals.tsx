import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Loader2, CheckCircle } from "lucide-react";
import type { WithdrawalRequest, User } from "@shared/schema";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

interface WithdrawalRequestWithUser extends WithdrawalRequest {
  user: User;
}

export default function AdminWithdrawals() {
  const { toast } = useToast();

  // Get all withdrawal requests with user details
  const { data: withdrawalRequests = [], isLoading } = useQuery<WithdrawalRequestWithUser[]>({
    queryKey: ["/api/admin/withdrawals"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const response = await fetch(`/api/admin/withdrawals/${requestId}/complete`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update withdrawal status");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Withdrawal request marked as completed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/withdrawals"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingRequests = withdrawalRequests.filter(
    (request) => request.status === "pending"
  );

  const completedRequests = withdrawalRequests.filter(
    (request) => request.status === "completed"
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IndianRupee className="h-5 w-5" />
            Pending Withdrawal Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No pending withdrawal requests
              </p>
            ) : (
              pendingRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium text-lg">
                          ₹{request.amount.toFixed(2)}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">User: </span>
                          {request.user.name} ({request.user.username})
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">UPI: </span>
                          {request.upiId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Requested on: {format(new Date(request.createdAt), "PPp")}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => updateStatusMutation.mutate(request.id)}
                        disabled={updateStatusMutation.isPending}
                      >
                        {updateStatusMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Mark as Completed
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Completed Withdrawals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No completed withdrawals
              </p>
            ) : (
              completedRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="font-medium text-lg">
                          ₹{request.amount.toFixed(2)}
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">User: </span>
                          {request.user.name} ({request.user.username})
                        </p>
                        <p className="text-sm">
                          <span className="text-muted-foreground">UPI: </span>
                          {request.upiId}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Completed on: {format(new Date(request.completedAt!), "PPp")}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded-full text-sm bg-green-100 text-green-800">
                        Completed
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
  );
}
