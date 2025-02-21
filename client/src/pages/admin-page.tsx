import { MainNav } from "@/components/nav/main-nav";
import { useQuery } from "@tanstack/react-query";
import { UserDocument } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Users } from "lucide-react";

const bufferToDataUrl = (avatar: { data: Buffer; contentType: string }) => {
  if (!avatar?.data) return undefined;
  const base64String = Buffer.from(avatar.data).toString('base64');
  return `data:${avatar.contentType};base64,${base64String}`;
};

export default function AdminPage() {
  const { toast } = useToast();
  const { data: users } = useQuery<UserDocument[]>({
    queryKey: ["/api/admin/users"],
  });

  const [notificationForm, setNotificationForm] = useState({
    title: "",
    message: "",
    selectedUsers: [] as string[],
  });

  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const { data: networkUsers } = useQuery<UserDocument[]>({
    queryKey: ["/api/admin/network", selectedUser],
    enabled: !!selectedUser
  });

  const sendNotification = async () => {
    try {
      await apiRequest("POST", "/api/admin/notifications", {
        title: notificationForm.title,
        message: notificationForm.message,
        userIds: notificationForm.selectedUsers.length ? notificationForm.selectedUsers : undefined,
      });
      toast({ title: "Notification sent successfully" });
      setNotificationForm({ title: "", message: "", selectedUsers: [] });
    } catch (error) {
      toast({ 
        title: "Failed to send notification", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Network View</TabsTrigger>
            <TabsTrigger value="notifications">Send Notifications</TabsTrigger>
            <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Network Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">All Users</h3>
                    <div className="space-y-4 max-h-[600px] overflow-y-auto">
                      {users?.map((user) => (
                        <div
                          key={user._id.toString()}
                          className={`flex items-center space-x-4 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedUser === user._id.toString() ? 'bg-primary/10' : 'hover:bg-muted'
                          }`}
                          onClick={() => setSelectedUser(user._id.toString())}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={bufferToDataUrl(user.avatar!)} alt={user.username} />
                            <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-medium">{user.fullName}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-4">Network Details</h3>
                    {selectedUser ? (
                      <div className="space-y-6">
                        {networkUsers?.map((user) => (
                          <Card key={user._id.toString()} className="relative">
                            <CardContent className="pt-6">
                              <div className="absolute -top-4 left-4">
                                <Avatar className="h-8 w-8 ring-2 ring-background">
                                  <AvatarImage src={bufferToDataUrl(user.avatar!)} alt={user.username} />
                                  <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                              </div>
                              <div className="grid gap-2">
                                <div className="flex justify-between">
                                  <span className="font-medium">{user.fullName}</span>
                                  <span className="text-sm text-muted-foreground">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  <p>@{user.username}</p>
                                  <p>{user.email}</p>
                                  <p>{user.phone}</p>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Users className="h-4 w-4 mr-1" />
                                  <span>Referral Code: {user.referralCode}</span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                        {!networkUsers?.length && (
                          <div className="text-center py-8 text-muted-foreground">
                            No referrals in network
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        Select a user to view their network
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Send Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Notification Title"
                  value={notificationForm.title}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                />
                <Textarea
                  placeholder="Notification Message (HTML supported)"
                  value={notificationForm.message}
                  onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                  className="min-h-[200px]"
                />
                <div>
                  <h4 className="mb-2 text-sm font-medium">Select Users (leave empty to send to all)</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {users?.map((user) => (
                      <label key={user._id.toString()} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={notificationForm.selectedUsers.includes(user._id.toString())}
                          onChange={(e) => {
                            setNotificationForm(prev => ({
                              ...prev,
                              selectedUsers: e.target.checked
                                ? [...prev.selectedUsers, user._id.toString()]
                                : prev.selectedUsers.filter(id => id !== user._id.toString())
                            }));
                          }}
                        />
                        <span>{user.username}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={sendNotification}>Send Notification</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="withdrawals">
            <Card>
              <CardHeader>
                <CardTitle>Withdrawal Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Add withdrawal request table here */}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}