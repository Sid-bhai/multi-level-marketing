import { MainNav } from "@/components/nav/main-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { UserDocument } from "@shared/schema";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Users, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ReferralsPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: referrals, isLoading, error } = useQuery<UserDocument[]>({
    queryKey: [`/api/referrals/${user?._id}`],
    enabled: !!user,
  });

  const copyReferralLink = async () => {
    const link = `${window.location.origin}/auth?ref=${user?.referralCode}`;
    await navigator.clipboard.writeText(link);
    toast({ title: "Referral link copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      <main className="container mx-auto p-4 space-y-6">
        <h1 className="text-3xl font-bold">Referrals</h1>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Referral Link</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-2">
                <Input 
                  value={`${window.location.origin}/auth?ref=${user?.referralCode}`}
                  readOnly
                />
                <Button onClick={copyReferralLink}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Share this link with others to earn commissions when they join and make transactions.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Your Referrals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  <p>Failed to load referrals</p>
                  <p className="text-sm">Please try again later</p>
                </div>
              ) : referrals?.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Join Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {referrals.map((referral) => (
                      <TableRow key={referral._id}>
                        <TableCell>{referral.username}</TableCell>
                        <TableCell>{referral.fullName}</TableCell>
                        <TableCell>
                          {new Date(referral.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Active
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>You haven't referred anyone yet</p>
                  <p className="text-sm">Share your referral link to start earning!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}