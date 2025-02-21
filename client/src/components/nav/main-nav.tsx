import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  User, 
  LogOut, 
  Bell, 
  Settings, 
  Inbox, 
  Menu,
  Home,
  Users,
  HelpCircle,
  CreditCard,
  BarChart3
} from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NotificationDocument } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function MainNav() {
  const { user, logoutMutation } = useAuth();
  const { data: notifications } = useQuery<NotificationDocument[]>({
    queryKey: ["/api/notifications"],
    enabled: !!user
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const markAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/mark-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    }
  });

  const menuItems = [
    { href: "/", icon: Home, label: "Dashboard" },
    { href: "/withdraw", icon: CreditCard, label: "Withdraw" },
    { href: "/referrals", icon: Users, label: "Referrals" },
    { href: "/stats", icon: BarChart3, label: "Statistics" },
    { href: "/support", icon: HelpCircle, label: "Support" },
  ];

  if (user?.isAdmin) {
    menuItems.push({ href: "/admin", icon: Settings, label: "Admin" });
  }

  return (
    <header className="border-b">
      <div className="container mx-auto flex h-16 items-center px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
              <SheetDescription>
                Navigate through different sections of the application
              </SheetDescription>
            </SheetHeader>
            <nav className="flex flex-col gap-2 mt-4">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="ml-auto flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="relative"
                onClick={() => unreadCount > 0 && markAsReadMutation.mutate()}
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-white flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              {notifications?.slice(0, 5).map((notification) => (
                <DropdownMenuItem key={notification._id.toString()} className="p-3">
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
              <Link href="/inbox">
                <DropdownMenuItem>
                  <span className="w-full text-center text-sm text-primary">
                    View All Notifications
                  </span>
                </DropdownMenuItem>
              </Link>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <Link href="/profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" /> Profile
                </DropdownMenuItem>
              </Link>
              <Link href="/inbox">
                <DropdownMenuItem>
                  <Inbox className="mr-2 h-4 w-4" /> Inbox
                </DropdownMenuItem>
              </Link>
              <Link href="/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" /> Settings
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}