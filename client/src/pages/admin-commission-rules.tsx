import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import type { CommissionRate } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

export default function AdminCommissionRules() {
  const [showAddRule, setShowAddRule] = useState(false);
  const [rank, setRank] = useState("");
  const [rate, setRate] = useState("");
  const [minReferrals, setMinReferrals] = useState("");
  const [minTeamSize, setMinTeamSize] = useState("");
  const { toast } = useToast();

  const { data: rules = [], isLoading } = useQuery<CommissionRate[]>({
    queryKey: ["/api/admin/commission-rules"],
  });

  const addRuleMutation = useMutation({
    mutationFn: async (data: {
      rank: string;
      rate: number;
      minimumReferrals: number;
      minimumTeamSize: number;
    }) => {
      const res = await fetch("/api/admin/commission-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add commission rule");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/commission-rules"] });
      setShowAddRule(false);
      setRank("");
      setRate("");
      setMinReferrals("");
      setMinTeamSize("");
      toast({
        title: "Success",
        description: "Commission rule added successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddRule = () => {
    const rateNum = parseFloat(rate);
    const minRefNum = parseInt(minReferrals);
    const minTeamNum = parseInt(minTeamSize);

    if (!rank || isNaN(rateNum) || isNaN(minRefNum) || isNaN(minTeamNum)) {
      toast({
        title: "Error",
        description: "Please fill all fields with valid values",
        variant: "destructive",
      });
      return;
    }

    addRuleMutation.mutate({
      rank,
      rate: rateNum,
      minimumReferrals: minRefNum,
      minimumTeamSize: minTeamNum,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Commission Rules</CardTitle>
          <Button onClick={() => setShowAddRule(true)}>Add New Rule</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Min. Referrals</TableHead>
                <TableHead>Min. Team Size</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.rank}</TableCell>
                  <TableCell>{(rule.rate * 100).toFixed(1)}%</TableCell>
                  <TableCell>{rule.minimumReferrals}</TableCell>
                  <TableCell>{rule.minimumTeamSize}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showAddRule} onOpenChange={setShowAddRule}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Commission Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rank">Rank</Label>
              <Input
                id="rank"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g., Silver, Gold, Diamond"
              />
            </div>
            <div>
              <Label htmlFor="rate">Commission Rate (%)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                placeholder="e.g., 5.5"
              />
            </div>
            <div>
              <Label htmlFor="minReferrals">Minimum Referrals</Label>
              <Input
                id="minReferrals"
                type="number"
                min="0"
                value={minReferrals}
                onChange={(e) => setMinReferrals(e.target.value)}
                placeholder="e.g., 10"
              />
            </div>
            <div>
              <Label htmlFor="minTeamSize">Minimum Team Size</Label>
              <Input
                id="minTeamSize"
                type="number"
                min="0"
                value={minTeamSize}
                onChange={(e) => setMinTeamSize(e.target.value)}
                placeholder="e.g., 50"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddRule(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddRule}
              disabled={addRuleMutation.isPending}
            >
              {addRuleMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Rule"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
