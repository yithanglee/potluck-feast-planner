import { Check, Plus, User } from "lucide-react";
import { Button } from "./ui/button";

interface FoodSlotProps {
  slotNumber: number;
  userName?: string;
  foodDescription?: string;
  isCurrentUser?: boolean;
  onClaim?: () => void;
  onRemove?: () => void;
  disabled?: boolean;
}

const FoodSlot = ({
  slotNumber,
  userName,
  foodDescription,
  isCurrentUser,
  onClaim,
  onRemove,
  disabled,
}: FoodSlotProps) => {
  const isFilled = !!userName;

  if (isFilled) {
    return (
      <div 
        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${
          isCurrentUser 
            ? "bg-primary/10 border-2 border-primary/30" 
            : "bg-secondary/50 border-2 border-transparent"
        }`}
      >
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}>
          {isCurrentUser ? <Check className="w-4 h-4" /> : <User className="w-4 h-4" />}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{userName}</p>
          {foodDescription && (
            <p className="text-sm text-muted-foreground truncate">{foodDescription}</p>
          )}
        </div>
        
        {isCurrentUser && onRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            取消
          </Button>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={onClaim}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed transition-all duration-300 ${
        disabled
          ? "border-muted bg-muted/30 cursor-not-allowed opacity-50"
          : "border-primary/30 hover:border-primary hover:bg-primary/5 cursor-pointer group"
      }`}
    >
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
        disabled ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
      } transition-all duration-300`}>
        <Plus className="w-4 h-4" />
      </div>
      
      <span className={`font-medium ${disabled ? "text-muted-foreground" : "text-muted-foreground group-hover:text-foreground"} transition-colors`}>
        空位 {slotNumber}
      </span>
    </button>
  );
};

export default FoodSlot;
