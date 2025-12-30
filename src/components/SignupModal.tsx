import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (description: string) => void;
  category: string;
  requiresDescription?: boolean;
  descriptionPlaceholder?: string;
}

const SignupModal = ({
  isOpen,
  onClose,
  onSubmit,
  category,
  requiresDescription = true,
  descriptionPlaceholder = "例：炒米粉 5人份",
}: SignupModalProps) => {
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requiresDescription || description.trim()) {
      onSubmit(description.trim());
      setDescription("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-card rounded-2xl shadow-xl p-6 w-full max-w-md animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center mb-6">
          <span className="text-4xl mb-2 block">🍽️</span>
          <h3 className="text-xl font-display font-bold">报名 {category}</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {requiresDescription && (
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                请注明食物和分量
              </label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={descriptionPlaceholder}
                required
                autoFocus
              />
            </div>
          )}
          
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              取消
            </Button>
            <Button type="submit" variant="sunny" className="flex-1">
              确认报名 ✓
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupModal;
