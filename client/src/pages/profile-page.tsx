import { MainNav } from "@/components/nav/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Camera } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    state: user?.state || "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        state: user.state || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await apiRequest("PATCH", `/api/users/${user!._id}`, data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Profile updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update profile", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const updateAvatarMutation = useMutation({
    mutationFn: async (imageUrl: string) => {
      await apiRequest("PATCH", `/api/users/${user!._id}`, { avatarUrl: imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({ title: "Avatar updated successfully" });
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to update avatar", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);

        // Upload to image hosting service (e.g. Cloudinary, ImgBB, etc)
        const response = await fetch('https://api.imgbb.com/1/upload?key=YOUR_IMGBB_KEY', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();
        if (data.success) {
          updateAvatarMutation.mutate(data.data.url);
        }
      } catch (error) {
        toast({ 
          title: "Failed to upload image", 
          description: "Please try again later",
          variant: "destructive" 
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Profile</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={user?.avatarUrl} alt={user?.username} />
                  <AvatarFallback>{user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <Button asChild disabled={updateAvatarMutation.isPending}>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <Camera className="mr-2 h-4 w-4" />
                      {updateAvatarMutation.isPending ? "Uploading..." : "Change Avatar"}
                    </label>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <Input
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                />
              </div>
              <Button 
                onClick={() => updateProfileMutation.mutate(formData)}
                disabled={updateProfileMutation.isPending}
                className="w-full"
              >
                {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}