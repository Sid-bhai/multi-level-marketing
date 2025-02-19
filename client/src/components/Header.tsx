import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  showBack?: boolean;
  isDashboard?: boolean;
  className?: string;
}

export default function Header({ showBack = false, isDashboard = false, className }: HeaderProps) {
  const [, navigate] = useLocation();

  const handleBack = () => {
    window.history.back();
  };

  return (
    <header className={cn("border-b bg-background", className)}>
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBack && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-accent"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}