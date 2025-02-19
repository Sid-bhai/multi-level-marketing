import { User } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Mail, Phone, Calendar } from "lucide-react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from "react";

interface MemberCardProps {
  member: User;
  onClick: () => void;
  onCollapse: () => void;
  isCollapsed: boolean;
}

export default function MemberCard({ member, onClick, onCollapse, isCollapsed }: MemberCardProps) {
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressed, setIsLongPressed] = useState(false);

  const handleTouchStart = () => {
    const timer = setTimeout(() => {
      setIsLongPressed(true);
      onClick();
    }, 500); // 500ms for long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    // Only reset if it was long pressed
    if (isLongPressed) {
      setIsLongPressed(false);
    }
  };

  useEffect(() => {
    return () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
      }
    };
  }, [longPressTimer]);

  const defaultAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`;

  return (
    <Card 
      className="w-64 p-4 cursor-pointer hover:shadow-lg transition-shadow relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div className="flex flex-col items-center mb-4">
        <Avatar className="h-16 w-16 mb-2">
          <AvatarImage src={member.photoURL || defaultAvatar} alt={member.name} />
          <AvatarFallback className="text-lg">{member.name[0]}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-lg text-center">{member.name}</h3>
      </div>

      {isLongPressed && (
        <div className="text-sm text-muted-foreground space-y-1">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {member.email}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {member.phone || 'N/A'}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {format(new Date(member.joinedAt), "MMM d, yyyy")}
          </div>
        </div>
      )}

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2"
        onClick={(e) => {
          e.stopPropagation();
          onCollapse();
        }}
      >
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronUp className="h-4 w-4" />
        )}
      </Button>
    </Card>
  );
}