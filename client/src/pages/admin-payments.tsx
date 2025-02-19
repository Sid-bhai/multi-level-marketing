import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { IndianRupee, Loader2, CheckCircle, X } from "lucide-react";
import type { PaymentRequest, User } from "@shared/schema";
import { format } from "date-fns";
import { queryClient } from "@/lib/queryClient";

interface PaymentRequestWithUser extends PaymentRequest {
  user: User;
}

export default function AdminPayments() {
  const { toast } = useToast();

  const { data: paymentRequests = [], isLoading } = useQuery<PaymentRequestWithUser[]>({
    queryKey: ["/api/admin/payments"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number, status: 'completed' | 'rejected' }) => {
      const response = await fetch(`/api/admin/payments/${requestId}/${status}`, {
        method: "POST",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${status} payment`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/payments"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingRequests = paymentRequests.filter(
    (request) => request.status === "pending"
  );

  const completedRequests = paymentRequests.filter(
    (request) => request.status === "completed"
  );

  const rejectedRequests = paymentRequests.filter(
    (request) => request.status === "rejected"
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
            Pending Payment Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pendingRequests.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No pending payment requests
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
                          <span className="text-muted-foreground">Description: </span>
                          {request.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Requested on: {format(new Date(request.createdAt), "PPp")}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => updateStatusMutation.mutate({
                            requestId: request.id,
                            status: "completed"
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          {updateStatusMutation.isPending ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </>
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex items-center gap-2"
                          onClick={() => updateStatusMutation.mutate({
                            requestId: request.id,
                            status: "rejected"
                          })}
                          disabled={updateStatusMutation.isPending}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
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
          <CardTitle>Completed Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No completed payments
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
                          <span className="text-muted-foreground">Description: </span>
                          {request.description}
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

      <Card>
        <CardHeader>
          <CardTitle>Rejected Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rejectedRequests.length === 0 ? (
              <p className="text-center text-muted-foreground">
                No rejected payments
              </p>
            ) : (
              rejectedRequests.map((request) => (
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
                          <span className="text-muted-foreground">Description: </span>
                          {request.description}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Rejected on: {format(new Date(request.completedAt!), "PPp")}
                        </p>
                      </div>
                      <div className="px-2 py-1 rounded-full text-sm bg-red-100 text-red-800">
                        Rejected
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
