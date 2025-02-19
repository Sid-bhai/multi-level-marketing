import { Progress } from "@/components/ui/progress";

interface PasswordStrengthMeterProps {
  password: string;
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const calculateStrength = (password: string): number => {
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    
    // Character type checks
    if (/[A-Z]/.test(password)) score += 20; // Uppercase
    if (/[a-z]/.test(password)) score += 20; // Lowercase
    if (/[0-9]/.test(password)) score += 20; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 20; // Special characters
    
    // Additional complexity checks
    if (/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[^A-Za-z0-9]).{12,}$/.test(password)) {
      score += 10; // Bonus for meeting all criteria with 12+ chars
    }
    
    return Math.min(score, 100);
  };

  const getStrengthColor = (strength: number): string => {
    if (strength < 40) return "bg-destructive";
    if (strength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = (strength: number): string => {
    if (strength < 40) return "Weak";
    if (strength < 70) return "Moderate";
    return "Strong";
  };

  const strength = calculateStrength(password);
  const color = getStrengthColor(strength);
  const text = getStrengthText(strength);

  return (
    <div className="space-y-2">
      <Progress value={strength} className={color} />
      <p className="text-sm text-muted-foreground">
        Password Strength: <span className="font-medium">{text}</span>
      </p>
    </div>
  );
}
