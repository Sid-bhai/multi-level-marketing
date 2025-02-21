import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { User as UserIcon, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function ReferralTree() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const { data: referrals } = useQuery<User[]>({
    queryKey: [`/api/referrals/${user?.id}`],
  });

  const referralUrl = `${window.location.origin}/auth?ref=${user?.referralCode}`;

  const copyReferralLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopied(true);
      toast({ title: "Referral link copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({ 
        title: "Failed to copy referral link", 
        variant: "destructive" 
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Referrals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 border rounded-lg space-y-2">
            <p className="text-sm font-medium">Your Referral Link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-muted p-2 rounded text-sm break-all">
                {referralUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={copyReferralLink}
              >
                {copied ? (
                  <CheckCheck className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {referrals?.map((referral) => (
              <div
                key={referral.id}
                className="flex items-center p-3 border rounded-lg"
              >
                <UserIcon className="h-5 w-5 mr-3 text-muted-foreground" />
                <div className="flex-1">
                  <p className="font-medium">{referral.username}</p>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Full Name: {referral.fullName}</p>
                    <p>Joined: {new Date(referral.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}

            {!referrals?.length && (
              <p className="text-muted-foreground text-center py-4">
                You haven't referred anyone yet
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}