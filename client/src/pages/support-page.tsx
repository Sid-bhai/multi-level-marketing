import { MainNav } from "@/components/nav/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Send } from "lucide-react";

export default function SupportPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { subject: string; message: string }) => {
      await apiRequest("POST", "/api/support", {
        userId: user!.id,
        ...data,
      });
    },
    onSuccess: () => {
      toast({ title: "Message sent successfully" });
      setMessage("");
      setSubject("");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to send message", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const handleSubmit = () => {
    if (!subject.trim() || !message.trim()) {
      toast({ 
        title: "Please fill all fields", 
        variant: "destructive" 
      });
      return;
    }
    sendMessageMutation.mutate({ subject, message });
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Support</h1>

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's your query about?"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue or question..."
                className="min-h-[200px]"
              />
            </div>
            <Button 
              onClick={handleSubmit}
              disabled={sendMessageMutation.isPending}
              className="w-full"
            >
              {sendMessageMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
