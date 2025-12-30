import { ReactNode } from "react";

interface FoodCategoryProps {
  emoji: string;
  title: string;
  description?: string;
  children: ReactNode;
  filledSlots: number;
  totalSlots: number;
}

const FoodCategory = ({
  emoji,
  title,
  description,
  children,
  filledSlots,
  totalSlots,
}: FoodCategoryProps) => {
  const progressPercent = (filledSlots / totalSlots) * 100;
  const isFull = filledSlots >= totalSlots;

  return (
    <section className="card-picnic p-6 animate-fade-in">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl animate-float" style={{ animationDelay: `${Math.random() * 2}s` }}>
            {emoji}
          </span>
          <div>
            <h2 className="text-xl font-display font-bold text-foreground">{title}</h2>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
          isFull 
            ? "bg-accent text-accent-foreground" 
            : "bg-secondary text-secondary-foreground"
        }`}>
          {filledSlots}/{totalSlots}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="h-2 bg-secondary rounded-full mb-4 overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            isFull ? "bg-accent" : "bg-primary"
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      <div className="space-y-2">
        {children}
      </div>
    </section>
  );
};

export default FoodCategory;
