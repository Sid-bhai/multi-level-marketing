import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Search, LogOut, Bell, IndianRupee } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { User } from "@shared/schema";
import Header from "@/components/Header";

export default function AdminDashboard() {
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [notificationText, setNotificationText] = useState("");
  const [notificationSubject, setNotificationSubject] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
  });

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: 'include',
      });
      navigate("/admin-login");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };

  const sendNotification = async () => {
    if (!selectedUser || !notificationText || !notificationSubject) return;

    try {
      await fetch("/api/admin/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          subject: notificationSubject,
          message: notificationText,
          htmlContent: notificationText,
        }),
        credentials: 'include',
      });

      toast({
        title: "Success",
        description: "Notification sent successfully",
      });
      setShowNotification(false);
      setNotificationText("");
      setNotificationSubject("");
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.username.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Search className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header isDashboard={true} />

      <main className="container mx-auto p-4 space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                +{users.filter(u => {
                  const joinedDate = new Date(u.joinedAt);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - joinedDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length} this week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => {
                  const lastActive = new Date(u.joinedAt);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Active in last 7 days
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Inactive Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => {
                  const lastActive = new Date(u.joinedAt);
                  const now = new Date();
                  const diffTime = Math.abs(now.getTime() - lastActive.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays > 7;
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Inactive for 7+ days
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Avatar>
                            <AvatarFallback>{user.name[0]}</AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{format(new Date(user.joinedAt), "PP")}</TableCell>
                      <TableCell>₹{user.balance.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowNotification(true);
                          }}
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Dialog open={showNotification} onOpenChange={setShowNotification}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Send Notification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarFallback>{selectedUser?.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedUser?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser?.email}</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="notification-subject">Subject</Label>
                  <Input
                    id="notification-subject"
                    placeholder="Subject..."
                    value={notificationSubject}
                    onChange={(e) => setNotificationSubject(e.target.value)}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="notification-text">Message (HTML)</Label>
                    <Textarea
                      id="notification-text"
                      placeholder="Enter notification message with HTML formatting..."
                      value={notificationText}
                      onChange={(e) => setNotificationText(e.target.value)}
                      className="h-[200px]"
                    />
                  </div>
                  <div>
                    <Label>Preview</Label>
                    <div className="border rounded-md p-4 h-[200px] overflow-auto prose prose-sm">
                      <div
                        dangerouslySetInnerHTML={{ __html: notificationText }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNotification(false)}>
                Cancel
              </Button>
              <Button onClick={sendNotification}>Send Notification</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}