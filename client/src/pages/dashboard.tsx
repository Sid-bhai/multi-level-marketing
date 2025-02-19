import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useLocation } from "wouter";
import { User, ReferralNode, Notification } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import ReferralTree from "@/components/ReferralTree";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, UserCircle, LogOut, Settings, Copy, IndianRupee, Users, Award, Loader2, Bell, Wallet, Plus } from "lucide-react";
import { format } from "date-fns";

const markAsRead = async (notificationId: number) => {
  try {
    await apiRequest("PATCH", `/api/notifications/${notificationId}`, { read: true });
    // Invalidate notifications query to refresh the list
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

export default function Dashboard() {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentDescription, setPaymentDescription] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: currentUser, isLoading: isUserLoading } = useQuery<User>({
    queryKey: ["/api/user"],
  });

  const { data: referralTree, isLoading: isTreeLoading } = useQuery<ReferralNode>({
    queryKey: ["/api/referrals/tree"],
  });

  const { data: commissionRate = 0 } = useQuery<number>({
    queryKey: ["/api/commission/rate"],
  });

  // Add notifications query
  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
      queryClient.clear();
      navigate("/login");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddPayment = async () => {
    try {
      const amount = parseFloat(paymentAmount);
      if (isNaN(amount) || amount < 100) {
        throw new Error("Please enter a valid amount (minimum ₹100)");
      }

      await apiRequest("POST", "/api/payments/request", {
        amount,
        description: paymentDescription,
      });

      toast({
        title: "Success",
        description: "Payment request submitted successfully",
      });

      setShowAddPayment(false);
      setPaymentAmount("");
      setPaymentDescription("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const referralUrl = currentUser ? `${window.location.origin}/register?ref=${currentUser.referralCode}` : '';

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralUrl);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  if (isUserLoading || isTreeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/withdraw")}>
                      <Wallet className="mr-2 h-4 w-4" />
                      Withdraw Funds
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/notifications")}>
                      <Bell className="mr-2 h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          {unreadCount}
                        </span>
                      )}
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/profile")}>
                      <UserCircle className="mr-2 h-4 w-4" />
                      Profile
                    </Button>
                    <Button variant="ghost" className="w-full justify-start" onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Add Notification Bell with Popover */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs flex items-center justify-center text-primary-foreground">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0" align="end">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle>Notifications</CardTitle>
                    </CardHeader>
                    <CardContent className="max-h-[300px] overflow-auto space-y-4">
                      {notifications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center">
                          No notifications yet
                        </p>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-3 rounded-lg ${
                              notification.read ? 'bg-muted/50' : 'bg-muted'
                            }`}
                            onClick={() => !notification.read && markAsRead(notification.id)}
                          >
                            <h4 className="font-medium">{notification.subject}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-2">
                              {format(new Date(notification.createdAt), "PPp")}
                            </p>
                          </div>
                        ))
                      )}
                    </CardContent>
                    {notifications.length > 0 && (
                      <div className="p-4 border-t">
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={() => navigate("/notifications")}
                        >
                          View All Notifications
                        </Button>
                      </div>
                    )}
                  </Card>
                </PopoverContent>
              </Popover>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar>
                    <AvatarImage src={currentUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`} />
                    <AvatarFallback>{currentUser.name[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" />Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{currentUser.balance.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                Commission Rate: {(commissionRate * 100).toFixed(1)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Your Direct Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser.referralCount}</div>
              <p className="text-xs text-muted-foreground">Commission Earned: ₹{currentUser.totalCommissionEarned.toLocaleString('en-IN')}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ₹{(currentUser.balance + currentUser.totalPayout).toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">
                Paid out: ₹{currentUser.totalPayout.toLocaleString('en-IN')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rank</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentUser.rank}</div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => setShowAddPayment(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Referral System */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
            <CardDescription>Share this link to grow your network</CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Input value={referralUrl} readOnly />
            <Button onClick={copyReferralLink} variant="secondary">
              <Copy className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        {/* Referral Network Visualization */}
        <Card>
          <CardHeader>
            <CardTitle>Your Direct Referrals</CardTitle>
            <CardDescription>View and manage your referrals</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {referralTree ? (
              <ReferralTree node={referralTree} onUserClick={setSelectedUser} />
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                No referrals yet. Share your referral link to grow your network.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Payment Dialog */}
        <Dialog open={showAddPayment} onOpenChange={setShowAddPayment}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="100"
                  step="100"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={paymentDescription}
                  onChange={(e) => setPaymentDescription(e.target.value)}
                  placeholder="Enter payment description"
                />
              </div>
              <Button onClick={handleAddPayment} className="w-full">
                Submit Payment Request
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}