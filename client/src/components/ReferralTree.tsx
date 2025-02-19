import { useState } from "react";
import { ReferralNode, User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ReferralTreeProps {
  node: ReferralNode;
  onUserClick: (user: User) => void;
}

export default function ReferralTree({ node, onUserClick }: ReferralTreeProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [longPressed, setLongPressed] = useState<number | null>(null);

  const toggleNode = (userId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (expandedNodes.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedNodes(newExpanded);
  };

  const handlePressStart = (userId: number) => {
    const timer = setTimeout(() => {
      setLongPressed(userId);
    }, 500); // 500ms for long press
    setPressTimer(timer);
  };

  const handlePressEnd = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    setLongPressed(null);
  };

  const renderNode = (node: ReferralNode, level: number = 0) => {
    const isExpanded = expandedNodes.has(node.user.id);
    const hasReferrals = node.referrals.length > 0;
    const isLongPressed = longPressed === node.user.id;
    const defaultAvatar = node.user.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(node.user.name)}`;

    return (
      <div key={node.user.id} style={{ marginLeft: `${level * 2}rem` }}>
        <Card className="mb-2 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {hasReferrals && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleNode(node.user.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              )}
              <div 
                className="flex items-center gap-2 cursor-pointer" 
                onMouseDown={() => handlePressStart(node.user.id)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={() => handlePressStart(node.user.id)}
                onTouchEnd={handlePressEnd}
                onClick={() => onUserClick(node.user)}
              >
                <Avatar>
                  <AvatarImage src={defaultAvatar} />
                  <AvatarFallback>{node.user.name[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{node.user.name}</p>
                  {isLongPressed && (
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Username: {node.user.username}</p>
                      <p>Email: {node.user.email}</p>
                      <p>Phone: {node.user.phone}</p>
                      <p>State: {node.user.state}</p>
                      <p>Joined: {format(new Date(node.user.joinedAt), "PP")}</p>
                      <p>Direct Referrals: {node.referrals.length}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">₹{node.user.balance.toLocaleString('en-IN')}</p>
              <p className="text-sm text-muted-foreground">
                {node.referrals.length} referral{node.referrals.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </Card>
        {isExpanded && node.referrals.map(child => renderNode(child, level + 1))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {renderNode(node)}
    </div>
  );
}